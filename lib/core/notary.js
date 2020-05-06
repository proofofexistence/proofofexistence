'use strict'

const core = require('../core')
const store = require('../store')

const Insight = require('../clients/insight')
const insightApi = new Insight()

const chains = require('../chains')
const bitcore = chains.get()
const _ = require('lodash')

const incomingHDPrivateKey = new bitcore.HDPrivateKey(chains.incomingPrivateKey())
const outgoingHDPublicKey = new bitcore.HDPublicKey(chains.outgoingPublicKey())
const defaultFeePerKb = 10000 // satoshis

/**
 * A bitcore Unit for the Docproof price
 *
 * If the document price is not set in the configuration, it will be set automatically.
 *
 * @returns {Unit} A bitcore currency unit
 */

async function docproofPrice () {
  let price = core.docproof.price()

  if (price.satoshis === 0) {
    const feePerKb = await lookupFeePerKb()
    const feeMultiplier = chains.feeMultiplier()
    price = core.docproof.adjustedPrice(feePerKb, feeMultiplier)
  }

  checkPrice(price)

  return price
}

function checkPrice (docproofPrice) {
  store.getPrice(chains.chain(), chains.network())
    .then((storePrice) => {
      if (storePrice && storePrice !== docproofPrice.satoshis) {
        console.log('price change', storePrice, 'to', docproofPrice.satoshis)

        core.mail.sendAdminPrice(storePrice, docproofPrice.satoshis, chains.chain(), chains.network())
          .then((results) => console.log('sending admin mail', results.envelope.to))
          .catch((err) => console.error('could not send admin mail', err.message))
      }

      store.putPrice(docproofPrice.satoshis, chains.chain(), chains.network())
    })
}

async function createDocproof (docproof) {
  const paymentAddress = bitcore.Address.fromString(docproof.payment_address)
  const checkAddress = paymentAddress.toString(true) // if BCH address, don't use prefix
  const addrFull = await insightApi.getTxs({address: checkAddress})
  const addressScript = bitcore.Script.fromAddress(paymentAddress)

  const payments = _.reduce(addrFull.txs, (payment, tx) => {
    let outputs = _.chain(tx.vout)
        .filter((output) => {
          return !output.spentTxId && _.includes(output.scriptPubKey.addresses, checkAddress)
        }).map((output, index) => {
          const satoshis = bitcore.Unit.fromBTC(output.value).toSatoshis()
          return {
            txId: tx.txid,
            outputIndex: output.n,
            satoshis: satoshis,
            script: addressScript
          }
        }).value()

    return _.concat(payment, outputs)
  }, [])

  const balance = _.reduce(payments, (sum, payment) => {
    return sum + payment.satoshis
  }, 0)

  const price = await docproofPrice()

  if (balance >= price.satoshis) {
    const feePerKb = await lookupFeePerKb()
    const feeMultiplier = chains.feeMultiplier()

    const changeAddress = outgoingHDPublicKey.derive(docproof.path).publicKey.toAddress()
    const signKey = incomingHDPrivateKey.derive(docproof.path).privateKey
    const tx = core.docproof.createTransaction(docproof.digest, payments, signKey, changeAddress, feePerKb, feeMultiplier)

    const serial = tx.serialize({disableDustOutputs: false})

    await insightApi.postTx(serial)

    docproof.tx = tx.hash
    docproof.feePerKilobyte = feePerKb
    docproof.fee = tx.fee
    docproof.pending = false
    docproof.txstamp = new Date()

    await store.putDocproof(paymentAddress, docproof)
    await store.putPendingSweep(paymentAddress, docproof.path)
  } else {
    console.log(`Insufficient funds for ${paymentAddress}`)
    await store.putTransactionLogError(paymentAddress, addrFull, 'Insufficient funds')
  }

  return docproof
}

async function confirmDocproof (docproof) {
  const paymentAddress = bitcore.Address.fromString(docproof.payment_address)
  const checkAddress = paymentAddress.toString(true) // if BCH address, don't use prefix
  const addrFull = await insightApi.getTxs({address: checkAddress})

  // TODO: Check outputs for the docproof
  const docproofTx = _.find(addrFull.txs, (tx) => {
    return core.transaction.isAddressAnInput(checkAddress, tx)
  })

  if (docproofTx && docproofTx.confirmations > 0) {
    docproof.tx = docproofTx.txid

    // convert unix epoch to timestamp
    docproof.blockstamp = new Date(docproofTx.blocktime * 1000).toISOString()

    await store.putDocproof(paymentAddress, docproof)

    let confirmed = _.omit(docproof, 'path')
    await store.addLatestConfirmed(confirmed)

    core.mail.sendAdminDocproof(docproof.digest, docproof.tx, docproof.path)
      .then((results) => console.log('sending admin mail', results.envelope.to))
      .catch((err) => console.error('could not send admin mail', err.message))
  }

  return docproof
}

async function estimateFee () {
  const feePerKb = await lookupFeePerKb()
  const feeMultiplier = chains.feeMultiplier()
  return core.docproof.estimateFee(feePerKb, feeMultiplier)
}

async function lookupFeePerKb () {
  var fee
  const cachedFeePerKb = await store.getFeeEstimate(chains.chain(), chains.network())

  if (cachedFeePerKb) {
    fee = cachedFeePerKb
  } else {
    try {
      fee = await getFeePerKb()
      await store.putFeeEstimate(fee, chains.chain(), chains.network())
    } catch (err) {
      // Fall back to the last stored fee, if any
      const storedFeePerKb = await store.getFeeEstimate(chains.chain(), chains.network(), 0)

      if (storedFeePerKb) {
        fee = storedFeePerKb
      } else {
        fee = defaultFeePerKb
      }
    }
  }

  return fee
}

async function getFeePerKb () {
  const nbBlocks = '2'
  const estimatedFee = await insightApi.getEstimateFee({nbBlocks: nbBlocks})

  const estFeePerKb = bitcore.Unit.fromBTC(estimatedFee[nbBlocks]).toSatoshis()

  const feePerKb = estFeePerKb > 0 ? estFeePerKb : defaultFeePerKb

  return feePerKb
}

module.exports = {
  confirmDocproof,
  createDocproof,
  docproofPrice,
  estimateFee,
  lookupFeePerKb
}
