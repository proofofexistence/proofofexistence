var dotenv = require('dotenv')
var bitcore = require('bitcore')
var Insight = require('bitcore-explorers').Insight
var insight = new Insight('testnet')

var privateKeyWIF = process.argv[2]
var targetAddress = process.argv[3]

dotenv.config({path: '.env.test'})

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet

var documentPrice = parseInt(process.env.DOCUMENT_PRICE)

var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF)
var sourceAddress = privateKey.toAddress(bitcore.Networks.testnet)

insight.getUnspentUtxos(sourceAddress, function(error, utxos) {
  if (error) {
    console.log(error)
  } else {
    console.log(utxos)

    var tx = new bitcore.Transaction()
    tx.from(utxos)
    tx.to(targetAddress, documentPrice)
    tx.change(sourceAddress)
    tx.sign(privateKey)
    tx.serialize()

    insight.broadcast(tx, function(error, transactionId) {
      if (error) {
        console.log(error)
      } else {
        console.log(transactionId)
      }
    })
  }
})
