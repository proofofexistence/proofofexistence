const express = require('express');
const router = express.Router();

const core = require('../core')
const register = require('../controllers/register')

/**
 * Register controller action.
 */

function create (req, res) {
  const hash = req.params.hash

  if (core.docproof.isValidDigest(req.params.hash)) {
    register(hash)
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

router.post('/register', (req, res) => {
  req.params.hash = req.body.d
  create(req, res)
})

module.exports = router
