const express = require('express');
const router = express.Router();

const store = require('../../lib/store')

function unconfirmed (req, res) {
  store.getLatestUnconfirmed().then(results => {
    res.set('Content-Type', 'application/json')
    res.send(results)
  })
}

function confirmed (req, res) {
  store.getLatestConfirmed().then(results => {
    res.set('Content-Type', 'application/json')
    res.send(results)
  })
}

router.get('confirmed', confirmed)
router.get('unconfirmed', unconfirmed)

module.exports = router
