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

function unconfirmedTx (address) {
  return {
    block_height: -1,
    block_index: -1,
    hash: "8ee19f29d2b33440d4ebafd981342024edaad9c704f08e78c8e3434eecc8c20d",
    addresses: [
      address,
      "mug8RpLkkPjv56gSXKxckXNo1Hez5yjYxt"
    ],
    total: 118980000,
    fees: 50000,
    ver: 1,
    double_spend: false,
    confirmations: 0,
    inputs: [
      {
        output_value: 119030000,
        addresses: [
          "mug8RpLkkPjv56gSXKxckXNo1Hez5yjYxt"
        ],
      }
    ],
    outputs: [
      {
        value: 200000,
        addresses: [
          address
        ],
      },
      {
        value: 118780000,
        addresses: [
          "mug8RpLkkPjv56gSXKxckXNo1Hez5yjYxt"
        ],
      }
    ]
  }
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
      unconfirmedTx(address)
    ]
  }
}

function txPush () {
  return {
    tx: {
      hash: "c0646857029f58834b84fafe17a3f15eb455d265a7b555ee2faca6e2069ce56a"
    }
  }
}

module.exports = {
  index: index,
  unconfirmedTxHook: unconfirmedTxHook,
  confirmedTxHook: confirmedTxHook,
  unconfirmedTx: unconfirmedTx,
  addressFull: addressFull,
  txPush: txPush
}
