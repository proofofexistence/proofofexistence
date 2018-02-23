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

module.exports = {
  getLatestConfirmed,
  getLatestUnconfirmed
}
