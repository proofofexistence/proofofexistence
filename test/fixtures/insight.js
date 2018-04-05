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

const txsAddress = require('./insights/address.json')
const txsPayment = require('./insights/payment.json')

Insights.prototype.estimateFee = {
  "2":0.00124099
}

Insights.prototype.txsAddress = txsAddress

Insights.prototype.addrFull = function () {
  if (this.confirmed) {
    return txsAddress
  } else {
    return txsPayment
  }
}

Insights.prototype.txSend = function (hash) {
  return {
    txid: hash
  }
}
