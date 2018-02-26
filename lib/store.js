'use strict'

const db = require('./db')

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
  getLatestConfirmed,
  getLatestUnconfirmed
}
