'use strict'

const config = require('config')
const core = require('../core')
const store = require('../store')

const Insight = require('../clients/insight')
const insightApi = new Insight()

const chains = require('../chains')
const bitcore = chains.get()
const _ = require('lodash')

const incomingHDPrivateKey = new bitcore.HDPrivateKey(chains.incomingPrivateKey())
const outgoingHDPublicKey = new bitcore.HDPublicKey(chains.outgoingPublicKey())

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

  if (balance >= config.get('documentPrice')) {
    const nbBlocks = '2'
    const estimateFee = await insightApi.getEstimateFee({nbBlocks: nbBlocks})

    const defaultFeePerKb = 10000
    const estFeePerKb = bitcore.Unit.fromBTC(estimateFee[nbBlocks]).toSatoshis()

    const feePerKb = estFeePerKb > 0 ? estFeePerKb : defaultFeePerKb

    const changeAddress = outgoingHDPublicKey.derive(docproof.path).publicKey.toAddress()
    const signKey = incomingHDPrivateKey.derive(docproof.path).privateKey
    const tx = core.docproof.createTransaction(docproof.digest, payments, signKey, changeAddress, feePerKb, config.get('feeMultiplier'))

    const serial = tx.serialize()

    await insightApi.postTx(serial)

    docproof.tx = tx.hash
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

    await core.mail.sendAdminDocproof(docproof.digest, docproof.tx, docproof.path, config.get('networkName'))
  }

  return docproof
}

module.exports = {
  confirmDocproof,
  createDocproof
}
