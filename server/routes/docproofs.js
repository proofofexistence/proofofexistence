const core = require('../../lib/core')
const SpecialOps = require('../../lib/clients/specialops')

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
        res.json(results)
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

module.exports = {
  docproofs
}
