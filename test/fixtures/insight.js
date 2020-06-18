const fs = require('fs')
var path = require('path')
var _ = require('lodash')

const Insights = function () {
  this.confirmed = false
}

module.exports = Insights

Insights.prototype.reset = function() {
  this.confirmed = false
}

const txsUnspent = require('./insights/unspent.json')

Insights.prototype.estimateFee = {
  "feerate": "0.00124099"
}

Insights.prototype.getBalance = {
    "confirmed": 5000000000,
    "unconfirmed": 0,
    "balance": 5000000000
}

Insights.prototype.getUnspent = txsUnspent

Insights.prototype.txSend = function (hash) {
  return {
    txid: hash
  }
}
