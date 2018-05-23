'use strict'

const config = require('config')
const core = require('../core')
const store = require('../store')

/**
 * Get a document status.
 */

const obtain = async (hash) => {
  const docAddress = await store.getDigestAddress(hash)

  if (docAddress) {
    const docproof = await store.getDocproof(docAddress)
    return documentStatus(docproof)
  } else {
    return missingStatus()
  }
}

/**
 * Refresh a document status.
 */

const refresh = async (hash) => {
  const docAddress = await store.getDigestAddress(hash)

  if (docAddress) {
    let docproof = await store.getDocproof(docAddress)

    if (docproof.pending === true) {
      docproof = await core.notary.createDocproof(docproof)
    } else if (docproof.blockstamp === undefined) {
      docproof = await core.notary.confirmDocproof(docproof)
    }

    return documentStatus(docproof)
  } else {
    return missingStatus()
  }
}

/**
 * Reply body for a document status.
 */

function documentStatus (docproof) {
  return {
    digest: docproof.digest,
    payment_address: docproof.payment_address,
    pending: docproof.pending,
    network: config.get('app.defaultNetwork'),
    success: true,
    timestamp: core.util.formatDate(docproof.timestamp),
    tx: docproof.tx,
    txstamp: core.util.formatDate(docproof.txstamp),
    blockstamp: core.util.formatDate(docproof.blockstamp),
    price: config.get('documentPrice')
  }
}

/**
 * Reply body if a document has no status.
 */

function missingStatus () {
  return {
    success: false,
    reason: 'nonexistent'
  }
}

module.exports = {
  obtain,
  refresh
}
