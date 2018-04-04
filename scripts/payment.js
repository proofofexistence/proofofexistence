var bitcore = require('bitcore-lib')

var config = require('config')
var blockcypher = require('../lib/clients/blockcypher')

var privateKeyWIF = process.argv[2]
var targetAddress = process.argv[3]
var paymentAmount = parseInt(process.argv[4] || config.get('documentPrice'))

var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF)
var sourceAddress = privateKey.toAddress(bitcore.Networks.testnet)

blockcypher.getAddr(sourceAddress, { unspentOnly: true, includeScript: true })
  .then(results => {
    let confirmedTxs = results.txrefs || []
    let unconfirmedTxs = results.unconfirmed_txrefs || []

    let txrefs = confirmedTxs.concat(unconfirmedTxs)

    let utxos = txrefs.map(txref => {
      return bitcore.Transaction.UnspentOutput({
        address: sourceAddress,
        outputIndex: txref.tx_output_n,
        satoshis: txref.value,
        scriptPubKey: txref.script,
        txid: txref.tx_hash
      })
    })

    console.log(utxos)

    let tx = new bitcore.Transaction()
    tx.from(utxos)
    tx.to(targetAddress, paymentAmount)
    tx.change(sourceAddress)
    tx.fee(50000)
    tx.sign(privateKey)

    let hex = tx.serialize()

    return blockcypher.pushTX(hex)
  }).then(results => {
    console.log(results.tx.hash)
  })
