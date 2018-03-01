'use strict'

const store = require('../../store')

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

module.exports = {
  confirmed,
  unconfirmed
}
