const core = require('../../lib/core')
const status = require('../../lib/controllers/status')
const register = require('../../lib/controllers/register')

/**
 * Register controller action.
 */

function create (req, res) {
  const {d} = req.body

  if (core.docproof.isValidDigest(d)) {
    register(d)
      .then(results => {
        res.json(results)
      }).catch(error => {
        console.log('Error digest: ' + d)
        console.log(error.message)
        res.status(500).end('Unexpected error')
      })
  } else {
    return res.status(400).json({
      reason: 'Invalid `hash` field'
    })
  }
}
/**
 * Status controller show action.
 */

function show (req, res) {
  const hash = req.params.hash || req.query.d

  if (core.docproof.isValidDigest(hash)) {
    status.obtain(hash)
      .then(results => {
        const status = results.success === true ? 200 : 404
        res.status(status).json(results)
      }).catch(error => {
        console.log('Error digest: ' + hash)
        console.log(error.message)

        res.status(500).end('Unexpected error')
      })
  } else {
    return res.status(400).json({
      reason: 'Invalid `hash` field'
    })
  }
}

/**
 * Status controller update action.
 */

function update (req, res) {
  const {d} = req.body
  if (core.docproof.isValidDigest(d)) {
    status.refresh(d)
      .then(results => {
        res.json(results)
      }).catch(error => {
        console.log('Error digest: ' + d)
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
  create,
  show,
  update
}
