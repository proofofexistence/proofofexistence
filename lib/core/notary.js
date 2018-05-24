'use strict'

const config = require('config')
const core = require('../core')
const store = require('../store')

const Insight = require('../clients/insight')
const insightApi = new Insight()

const bitcore = require('../bitcore')
const _ = require('lodash')

const chains = config.get('chains')
const defaultChain = config.get('app.defaultChain')
const defaultNetwork = config.get('app.defaultNetwork')
const network = chains[defaultChain].networks[defaultNetwork]

const incomingHDPrivateKey = new bitcore.HDPrivateKey(network.incomingPrivateKey)
const outgoingHDPublicKey = new bitcore.HDPublicKey(network.outgoingPublicKey)

async function createDocproof (docproof) {
  const paymentAddress = docproof.payment_address
  const addrFull = await insightApi.getTxs({address: paymentAddress})
  const addressScript = bitcore.Script.fromAddress(paymentAddress)

  const payments = _.reduce(addrFull.txs, (payment, tx) => {
    let outputs = _.chain(tx.vout)
        .filter((output) => {
          return !output.spentTxId && _.includes(output.scriptPubKey.addresses, paymentAddress)
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

    const pushedTx = await insightApi.postTx(serial)

    docproof.tx = pushedTx.txid
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
  const paymentAddress = docproof.payment_address
  const addrFull = await insightApi.getTxs({address: paymentAddress})

  // TODO: Check outputs for the docproof
  const docproofTx = _.find(addrFull.txs, (tx) => {
    return core.transaction.isAddressAnInput(paymentAddress, tx)
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
