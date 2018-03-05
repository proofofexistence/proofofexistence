'use strict'

const config = require('config')
const core = require('../core')
const store = require('../store')
const blockcypher = require('../clients/blockcypher')

const bitcore = require('bitcore-lib')
const _ = require('lodash')

const btc = config.get('currencies.btc')
const incomingHDPrivateKey = new bitcore.HDPrivateKey(btc.networks[btc.defaultNetwork].incomingPrivateKey)
const outgoingHDPublicKey = new bitcore.HDPublicKey(btc.networks[btc.defaultNetwork].outgoingPublicKey)

async function createDocproof (docproof) {
  const paymentAddress = docproof.payment_address
  const addrFull = await blockcypher.getAddrFull(paymentAddress, {limit: 50, txlimit: 2000})
  const addressScript = bitcore.Script.fromAddress(paymentAddress)

  const payments = _.reduce(addrFull.txs, (payment, tx) => {
    let outputs = _.chain(tx.outputs)
      .filter((output) => {
        return !output.spent_by && _.includes(output.addresses, paymentAddress)
      }).map((output, index) => {
        return {
          txId: tx.hash,
          outputIndex: index,
          satoshis: output.value,
          script: addressScript
        }
      }).value()

    return _.concat(payment, outputs)
  }, [])

  const balance = _.reduce(payments, (sum, payment) => {
    return sum + payment.satoshis
  }, 0)

  if (balance >= config.get('documentPrice')) {
    const chainResult = await blockcypher.getChain()

    const feePerKb = chainResult.medium_fee_per_kb
    const changeAddress = outgoingHDPublicKey.derive(docproof.path).publicKey.toAddress()
    const signKey = incomingHDPrivateKey.derive(docproof.path).privateKey
    const tx = core.docproof.createTransaction(docproof.digest, payments, signKey, changeAddress, feePerKb, config.get('feeMultiplier'))

    const serial = tx.serialize()

    const pushedTx = await blockcypher.pushTX(serial)

    docproof.tx = pushedTx.tx.hash
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
  const addrFull = await blockcypher.getAddrFull(paymentAddress, {limit: 50, txlimit: 2000})

  // TODO: Check outputs for the docproof
  const docproofTx = _.find(addrFull.txs, (tx) => {
    return core.transaction.isAddressAnInput(paymentAddress, tx)
  })

  if (docproofTx.confirmations > 0) {
    docproof.tx = docproofTx.hash
    docproof.blockstamp = docproofTx.confirmed

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
