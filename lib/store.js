'use strict'

const db = require('./db')

/**
 * Get an address from a document hash
 *
 * @returns {Promise} A string, or null
 */
function getDigestAddress (hash) {
  return new Promise((resolve, reject) => {
    db.get(`map-${hash}`)
      .then(results => { resolve(results) })
      .catch(() => { resolve(null) })
  })
}

/**
 * Create an address for a document hash
 *
 * @returns {Promise}
 */
function putDigestAddress (hash, address) {
  return db.put(`map-${hash}`, address)
}

/**
 * Register a document hash to an address
 *
 * @returns {Promise}
 */
function putDocproof (address, docproof) {
  return db.put(address.toString(), JSON.stringify(docproof))
}

/**
 * Get a document proof from an address.
 *
 * @returns {Promise}
 */
function getDocproof (address) {
  return new Promise((resolve, reject) => {
    db.get(address)
      .then(results => { resolve(JSON.parse(results)) })
      .catch(() => { resolve(null) })
  })
}

/**
 * Log a transaction
 *
 * @returns {Promise}
 */

function putTransactionLog (address, transaction) {
  db.put(address + '-log-' + new Date().getTime(), JSON.stringify({
    address: address,
    activity: true,
    body: transaction
  }))
}

/**
 * Log a transaction error
 *
 * @returns {Promise}
 */

function putTransactionLogError (address, addressFull, error) {
  db.put(address + '-log-' + new Date().getTime(), JSON.stringify({
    address: address,
    error: error,
    body: addressFull
  }))
}

/**
 * Add a pending sweep
 *
 * @returns {Promise} A JSON string
 */

function putPendingSweep (address, path) {
  return db.put('pending-sweep-' + address, path)
}

/**
 * Get the latest unconfirmed docproofs
 *
 * @returns {Promise} A JSON string
 */

function getLatestUnconfirmed () {
  return getConfirmed('latest-unconfirmed')
}

/**
 * Get the latest confirmed docproofs
 *
 * @returns {Promise} A JSON string
 */

function getLatestConfirmed () {
  return getConfirmed('latest-confirmed')
}

function getConfirmed (key) {
  return new Promise((resolve, reject) => {
    db.get(key)
      .then(results => { resolve(results) })
      .catch(() => { resolve('[]') })
  })
}

/**
 * Add the latest unconfirmed docproof
 */

function addLatestUnconfirmed (document) {
  return updateLatest(document, 'latest-unconfirmed')
}

function addLatestConfirmed (document) {
  return updateLatest(document, 'latest-confirmed')
}

async function updateLatest (document, key) {
  const latestRecord = await getConfirmed(key)
  const currentLatest = JSON.parse(latestRecord)

  let nextLatest = [document].concat(currentLatest)

  if (nextLatest.length > 5) {
    nextLatest.splice(5)
  }

  return db.put(key, JSON.stringify(nextLatest))
}

module.exports = {
  addLatestConfirmed,
  addLatestUnconfirmed,
  getDigestAddress,
  getDocproof,
  getLatestConfirmed,
  getLatestUnconfirmed,
  putDigestAddress,
  putDocproof,
  putPendingSweep,
  putTransactionLog,
  putTransactionLogError
}
