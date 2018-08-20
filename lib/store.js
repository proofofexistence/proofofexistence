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
 * Put a docproocf price in satoshis.
 *
 * @returns {Promise}
 */
function putPrice (price, chain, network) {
  return db.put(priceKey(chain, network), price)
}

/**
 * Get a docproof price in satoshis.
 *
 * @returns {Promise}
 */
function getPrice (chain, network) {
  return new Promise((resolve, reject) => {
    db.get(priceKey(chain, network))
      .then(results => {
        resolve(parseInt(results))
      })
      .catch(() => { resolve(null) })
  })
}

/**
 * Cache a fee estimate in satoshis.
 *
 * @returns {Promise}
 */
function putFeeEstimate (feePerKb, chain, network) {
  const estimate = {
    feePerKb: feePerKb,
    timestamp: Date.now()
  }
  return db.put(feeKey(chain, network), estimate, {valueEncoding: 'json'})
}

/**
 * Read a fee estimate in satoshis from cache. Expire after 6 hours.
 * Use a timeout of 0 to query with an infinite timeout.
 *
 * @returns {Promise}
 */
function getFeeEstimate (chain, network, timeout = 21600000) {
  return new Promise((resolve, reject) => {
    db.get(feeKey(chain, network), {valueEncoding: 'json'})
      .then(results => {
        const infiniteTimeout = timeout <= 0

        const now = Date.now()
        const timedOut = (now - results.timestamp) <= timeout

        if (timedOut || infiniteTimeout) {
          resolve(results.feePerKb)
        } else {
          resolve(null)
        }
      })
      .catch(() => { resolve(null) })
  })
}

function priceKey (chain, network) {
  return `admin-price-${chain}-${network}`
}

function feeKey (chain, network) {
  return `admin-fee-${chain}-${network}`
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
  getFeeEstimate,
  getLatestConfirmed,
  getLatestUnconfirmed,
  getPrice,
  putDigestAddress,
  putDocproof,
  putFeeEstimate,
  putPendingSweep,
  putPrice,
  putTransactionLog,
  putTransactionLogError
}
