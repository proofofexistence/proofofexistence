const config = require('config')
const Insight = require('../lib/clients/insight')
const insightApi = new Insight()

const chains = require('../lib/chains')
const bitcore = chains.get()

var privateKeyWIF = process.argv[2]
var targetAddress = process.argv[3]

var paymentAmount = parseInt(process.argv[4] || chains.documentPrice())

if (paymentAmount == 0) {
  console.error('Configure a price or set one as the final argument')
  process.exit(1)
}

var privateKey = bitcore.PrivateKey.fromWIF(privateKeyWIF)
var sourceAddress = privateKey.toAddress()

insightApi.getUtxo(sourceAddress)
  .then(results => {
    let utxos = results.map(txref => {
      return bitcore.Transaction.UnspentOutput({
        address: txref.address,
        outputIndex: txref.vout,
        satoshis: txref.satoshis,
        scriptPubKey: txref.scriptPubKey,
        txid: txref.txid
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

    return insightApi.postTx(hex)
  }).then(results => {
    console.log(results.txid)
  })
