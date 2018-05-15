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
  let docproofs = {}

  if (core.docproof.isValidDigest(hash)) {
    // TODO: add pagination query for additional data.
    specialops.getDocproofs(hash, {limit: 100})
      .then(results => {
        docproofs = results
        return getTxs(results.items)
      })
      .then(txs => {
        const items = txs.map(tx => {
          return {
            blockhash: tx.blockhash,
            blockheight: tx.blockheight,
            blocktime: tx.blocktime,
            confirmations: tx.confirmations,
            txid: tx.txid
          }
        }).sort((a, b) => {
          return a.blockheight > b.blockheight
        })

        docproofs.items = items

        return res.json(docproofs)
      }).catch(error => {
        console.log(error.message)

        res.status(error.statusCode).json({reason: error.error})
      })
  } else {
    return res.status(400).json({
      reason: 'Invalid `hash` field'
    })
  }
}

async function getTxs (docproofs) {
  const getTxs = docproofs.map(docproof => {
    return insight.getTx(docproof.txid)
  })

  return Promise.all(getTxs)
}

module.exports = {
  docproofs
}
