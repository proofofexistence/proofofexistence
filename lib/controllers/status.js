'use strict'

const config = require('config')
const core = require('../core')
const store = require('../store')
const request = require('request-promise-native')

/**
 * Get a document status.
 */

const obtain = async (hash) => {
  const docAddress = await store.getDigestAddress(hash)

  if (docAddress) {
    const docproof = await store.getDocproof(docAddress)
    // Wait for payment
    if (docproof.blockstamp === undefined) {
      const sib = await statusInBlockchain(hash)
      if (sib.success === true) {
        // FIXME: Fill all the status
        return documentStatus({ digest: hash, pending: false, tx: sib.tx, blockstamp: 1 })
      }
    }
    return documentStatus(docproof)
  } else {
    // Not registered
    const sib = await statusInBlockchain(hash)
    if (sib.success === true) {
      // FIXME: Fill all the status
      return documentStatus({ digest: hash, pending: false, tx: sib.tx, blockstamp: 1 })
    } else {
      return missingStatus()
    }
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

async function documentStatus (docproof) {
  const price = await core.notary.docproofPrice()

  return {
    digest: docproof.digest ? docproof.digest : '',
    payment_address: docproof.payment_address ? docproof.payment_address : '',
    pending: docproof.pending,
    network: config.get('app.defaultNetwork'),
    success: true,
    timestamp: docproof.timestamp ? core.util.formatDate(docproof.timestamp) : '',
    tx: docproof.tx ? docproof.tx : '',
    txstamp: docproof.txstamp ? core.util.formatDate(docproof.txstamp) : '',
    blockstamp: docproof.blockstamp ? core.util.formatDate(docproof.blockstamp) : '',
    price: price.satoshis
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

/**
 * Find the digest in the fullnode database
 */
async function statusInBlockchain (hash) {
  // NOTE: Search the hash in the BTC network only
  const urlr = 'https://api.smartbit.com.au/v1/blockchain/search'

  const doc = await request.get({
    url: urlr,
    strictSSL: true,
    json: true,
    qs: {q: hash}
  })

  if (doc.results[0] && doc.results[0].data && doc.results[0].data.txid) {
    return {
      success: true,
      tx: doc.results[0].data.txid
    }
  }

  return {
    success: false,
    reason: 'notfound'
  }
}

module.exports = {
  obtain,
  refresh
}
