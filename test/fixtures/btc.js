const fs = require('fs')
var path = require('path')

const Btc = function () {
  this.confirmed = false
}

module.exports = Btc

Btc.prototype.reset = function() {
  this.confirmed = false
}

Btc.prototype.index = {
  name: "BTC.test3",
  height: 1257475,
  hash: "000000000000036b6d00499fb5f0f2e9338c522beac7f990c5fd1eb21606a2c9",
  time: "2018-01-05T04:02:10.81913779Z",
  latest_url: "https://api.blockcypher.com/v1/btc/test3/blocks/000000000000036b6d00499fb5f0f2e9338c522beac7f990c5fd1eb21606a2c9",
  previous_hash: "000000002fc27a90018289174a214d13b08cca6eb78c070bbbc81139f7d270b0",
  previous_url: "https://api.blockcypher.com/v1/btc/test3/blocks/000000002fc27a90018289174a214d13b08cca6eb78c070bbbc81139f7d270b0",
  peer_count: 274,
  unconfirmed_count: 175,
  high_fee_per_kb: 323704,
  medium_fee_per_kb: 124099,
  low_fee_per_kb: 100000,
  last_fork_height: 1257419,
  last_fork_hash: "00000000a649380ad02f853a0c871e881c2fefbb53349f86a27e7668ad10535f"
}

Btc.prototype.unconfirmedTxHook = function (body, token) {
  return {
    id: 'ec9fe9d9-d8e1-4530-a1ed-1b099e6df26e',
    token: token,
    url: body.url,
    callback_errors: 0,
    address: body.address,
    event: 'unconfirmed-tx'
  }
}

Btc.prototype.confirmedTxHook = function (body, token) {
  return {
    id: 'd297fc60-4fe7-426e-b496-8ec80d0ce8e2',
    token: token,
    url: body.url,
    callback_errors: 0,
    address: body.address,
    event: 'confirmed-tx',
    confirmations: 1
  }
}

var unconfirmedPaymentFile = require('./tx/unconfirmed-payment.json')
var unconfirmedDocproofFile = require('./tx/unconfirmed-docproof.json')

var confirmedPaymentFile = require('./tx/confirmed-payment.json')
var confirmedDocproofFile = require('./tx/confirmed-docproof.json')

Btc.prototype.unconfirmedPaymentTx = function () {
  return unconfirmedPaymentFile
}

Btc.prototype.unconfirmedDocproofTx = function () {
  return unconfirmedDocproofFile
}

Btc.prototype.confirmedPaymentTx = function () {
  return confirmedPaymentFile
}

Btc.prototype.confirmedDocproofTx = function () {
  return confirmedDocproofFile
}

Btc.prototype.addressFull = function (address) {
  const fullAddr =  {
    address: address,
    total_received: 0,
    total_sent: 0,
    balance: 0,
    unconfirmed_balance: 0,
    final_balance: 0,
    n_tx: 0,
    unconfirmed_n_tx: 0,
    final_n_tx: 0,
    txs: []
  }

  if (this.confirmed) {
    fullAddr.total_received = 200000
    fullAddr.total_sent = 200000
    fullAddr.txs = [
      this.confirmedPaymentTx(),
      this.confirmedDocproofTx()
    ]
  } else {
    fullAddr.unconfirmed_balance = 200000
    fullAddr.final_balance = 200000
    fullAddr.txs = [
      this.unconfirmedPaymentTx()
    ]
  }

  return fullAddr
}

Btc.prototype.txPush = function (hash) {
  return {
    tx: {
      hash: hash
    }
  }
}
