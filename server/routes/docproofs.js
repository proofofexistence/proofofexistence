const _ = require('lodash')
const core = require('../../lib/core')
const Insight = require('../../lib/clients/insight')
const SpecialOps = require('../../lib/clients/specialops')

const insight = new Insight()
const specialops = new SpecialOps()

/**
 * Docproofs controller action.
 */

function docproofs (req, res) {
  const hash = req.params.hash

  if (core.docproof.isValidDigest(hash)) {
    // TODO: add pagination query for additional data.
    specialops.getDocproofs(hash, {limit: 100})
      .then(results => {
        return getProofs(results.items)
      })
      .then(txs => {
        const items = txs.sort((a, b) => {
          return a.blockheight > b.blockheight
        })

        const docproofs = {
          pagination: {},
          items: items
        }

        return res.json(docproofs)
      }).catch(error => {
        console.log(error.message)

        const statusCode = error.statusCode ? error.statusCode : 500

        res.status(statusCode).json({reason: error.error})
      })
  } else {
    return res.status(400).json({
      reason: 'Invalid `hash` field'
    })
  }
}

async function getProofs (docproofs) {
  const getTxs = docproofs.map(docproof => {
    return insight.getTx(docproof.txid)
  })

  const txs = await Promise.all(getTxs)

  const proofs = _.zip(docproofs, txs)

  return proofs.map(proof => {
    const [docproof, tx] = proof

    return {
      blockhash: tx.blockhash,
      blockheight: tx.blockheight,
      blocktime: tx.blocktime,
      confirmations: tx.confirmations,
      metadata: docproof.metadata,
      txid: tx.txid,
      outputIndex: docproof.outputIndex
    }
  })
}

module.exports = {
  docproofs
}
