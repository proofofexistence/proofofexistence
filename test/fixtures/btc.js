const fs = require('fs')
var path = require('path')

index = {
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

function unconfirmedTxHook (body, token) {
  return {
    id: 'ec9fe9d9-d8e1-4530-a1ed-1b099e6df26e',
    token: token,
    url: body.url,
    callback_errors: 0,
    address: body.address,
    event: 'unconfirmed-tx'
  }
}

function confirmedTxHook (body, token) {
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

function unconfirmedPaymentTx () {
  return unconfirmedPaymentFile
}

function unconfirmedDocproofTx () {
  return unconfirmedDocproofFile
}

function confirmedPaymentTx () {
  return confirmedPaymentFile
}

function confirmedDocproofTx () {
  return confirmedDocproofFile
}

function addressFull (address) {
  return  {
    address: address,
    total_received: 0,
    total_sent: 0,
    balance: 0,
    unconfirmed_balance: 200000,
    final_balance: 200000,
    n_tx: 0,
    unconfirmed_n_tx: 0,
    final_n_tx: 0,
    txs: [
      unconfirmedPaymentTx()
    ]
  }
}

function txPush (hash) {
  return {
    tx: {
      hash: hash
    }
  }
}

module.exports = {
  index: index,
  unconfirmedTxHook: unconfirmedTxHook,
  confirmedTxHook: confirmedTxHook,
  unconfirmedPaymentTx: unconfirmedPaymentTx,
  unconfirmedDocproofTx: unconfirmedDocproofTx,
  confirmedPaymentTx: confirmedPaymentTx,
  confirmedDocproofTx: confirmedDocproofTx,
  addressFull: addressFull,
  txPush: txPush
}
