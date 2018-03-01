'use strict'

const config = require('config')
const core = require('../../core')
const store = require('../../store')

const btc = config.get('currencies.btc')

/**
 * Get a document status.
 */

const status = async (hash) => {
  const docAddress = await store.getDigestAddress(hash)

  if (docAddress) {
    const docproof = await store.getDocproof(docAddress)
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
    network: btc.defaultNetwork,
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

/**
 * Status controller action.
 */

function show (req, res) {
  const hash = req.params.hash

  if (core.docproof.isValidDigest(req.params.hash)) {
    status(hash)
      .then(results => {
        const status = results.success === true ? 200 : 404
        res.status(status).json(results)
      }).catch(error => {
        console.log(error.message)

        res.status(500).end('Unexpected error')
      })
  } else {
    return res.status(400).json({
      reason: 'Invalid `hash` field'
    })
  }
}

module.exports = {
  show
}
