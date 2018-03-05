'use strict'

const core = require('../../core')
const store = require('../../store')

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
  console.log('unconfirmed callback', requestAddress)

  if (!core.transaction.isAddressAnOutput(requestAddress, requestTx)) {
    console.log('Not an output of tx', requestTx.hash)
    return
  }

  store.putTransactionLog(requestAddress, requestTx)

  const docproof = await store.getDocproof(requestAddress)

  return core.notary.createDocproof(docproof)
}

const confirmDocproof = async (requestAddress, requestTx) => {
  if (!core.transaction.isAddressAnInput(requestAddress, requestTx)) {
    console.log('Not an input of tx', requestTx.hash)
    return
  }

  store.putTransactionLog(requestAddress, requestTx)

  const docproof = await store.getDocproof(requestAddress)

  return core.notary.confirmDocproof(docproof)
}

module.exports = {
  confirmed,
  unconfirmed
}
