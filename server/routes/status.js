const express = require('express');
const router = express.Router();

const core = require('../../lib/core')
const status = require('../../lib/controllers/status')


/**
 * Status controller show action.
 */

function show (req, res) {
  const hash = req.params.hash

  if (core.docproof.isValidDigest(req.params.hash)) {
    status.obtain(hash)
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

/**
 * Status controller update action.
 */

function update (req, res) {
  const hash = req.params.hash

  if (core.docproof.isValidDigest(req.params.hash)) {
    status.refresh(hash)
      .then(results => {
        res.json(results)
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

// routes
router.get('/', (req, res) => {
  req.params.hash = req.query.d
  show(req, res)
})

router.get('/:hash', show)

router.post('/', (req, res) => {
  req.params.hash = req.body.hash || req.body.d
  update(req, res)
})

module.exports = router
