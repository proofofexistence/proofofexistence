'use strict'

const config = require('config')
const core = require('../../core')
const store = require('../../store')
const blockcypher = require('../../clients/blockcypher')

const bitcore = require('bitcore-lib')
const _ = require('lodash')

const btc = config.get('currencies.btc')
const incomingHDPrivateKey = new bitcore.HDPrivateKey(btc.networks[btc.defaultNetwork].incomingPrivateKey)
const outgoingHDPublicKey = new bitcore.HDPublicKey(btc.networks[btc.defaultNetwork].outgoingPublicKey)

/**
 * Unconfirmed controller action.
 */

function unconfirmed (req, res) {
  // ACK Web Hook
  res.end('')

  createDocproof(req.params.address, req.body)
    .catch(error => {
      console.log(error.message)
    })
}

/**
 * Confirmed controller action.
 */

function confirmed (req, res) {
  // ACK Blockcypher
  res.end('')

  confirmDocproof(req.params.address, req.body)
    .catch(error => {
      console.log(error.message)
    })
}

/**
 * Helpers.
 */

const createDocproof = async (requestAddress, requestTx) => {
  const addressScript = bitcore.Script.fromAddress(requestAddress)
  let outputs = []

  console.log('unconfirmed callback', requestAddress)

  if (!core.transaction.isAddressAnOutput(requestAddress, requestTx)) {
    console.log('Not an output of tx', requestTx.hash)
    return
  }

  store.putTransactionLog(requestAddress, requestTx)

  const docproof = await store.getDocproof(requestAddress)

  store.putPendingSweep(requestAddress, docproof.path)

  const addrFull = await blockcypher.getAddrFull(requestAddress, {limit: 50, txlimit: 2000})

  let satoshis = 0

  const hasAddress = output => output.addresses.reduce(
    (prev, address) => prev || (address === requestAddress), false
  )

  if (!addrFull.txs || !addrFull.txs.length) {
    await store.putTransactionLogError(requestAddress, addrFull, 'No result in request for txs for address')
    return Promise.reject(new Error(`No txs in address ${requestAddress}`))
  }

  addrFull.txs.map(tx => {
    tx.outputs.map((output, index) => {
      if (hasAddress(output)) {
        satoshis += output.value
        outputs.push({
          txId: tx.hash,
          outputIndex: index,
          satoshis: output.value,
          script: addressScript
        })
      }
    })
  })

  if (satoshis < config.get('documentPrice')) {
    await store.putTransactionLogError(requestAddress, addrFull, 'Insufficient funds')
    return Promise.reject(new Error(`Insufficient funds for ${requestAddress}`))
  }

  const chainResult = await blockcypher.getChain()

  const feePerKb = chainResult.medium_fee_per_kb
  const changeAddress = outgoingHDPublicKey.derive(docproof.path).publicKey.toAddress()
  const signKey = incomingHDPrivateKey.derive(docproof.path).privateKey
  const tx = core.docproof.createTransaction(docproof.digest, outputs, signKey, changeAddress, feePerKb, config.get('feeMultiplier'))

  const serial = tx.serialize()

  const pushedTx = await blockcypher.pushTX(serial)

  docproof.tx = pushedTx.tx.hash
  docproof.pending = false
  docproof.txstamp = new Date()

  return store.putDocproof(requestAddress, docproof)
}

const confirmDocproof = async (requestAddress, requestTx) => {
  if (!core.transaction.isAddressAnInput(requestAddress, requestTx)) {
    console.log('Not an input of tx', requestTx.hash)
    return
  }

  store.putTransactionLog(requestAddress, requestTx)

  const docproof = await store.getDocproof(requestAddress)

  docproof.tx = requestTx.hash
  docproof.blockstamp = requestTx.confirmed

  await store.putDocproof(requestAddress, docproof)

  let confirmed = _.omit(docproof, 'path')

  await store.addLatestConfirmed(confirmed)

  await core.mail.sendAdminDocproof(docproof.digest, docproof.tx, docproof.path, config.get('networkName'))

  return docproof
}

module.exports = {
  confirmed,
  unconfirmed
}
