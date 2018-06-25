'use strict'

const chains = require('./chains')
const bitcore = chains.get()

var fs = require('fs')
var prompt = require('prompt')

const Insight = require('../lib/clients/insight')
const insightApi = new Insight()

console.log('network: ', chains.network())

var masterKey, paths, targetAddress

prompt.start()

var promptSchema = {
  properties: {
    hdPrivateKey: {
      message: 'Please enter the master extended private key to use',
      required: true
    },
    filename: {
      message: 'Please enter the name of the file with the derivation paths',
      required: true
    },
    targetAddress: {
      message: 'Please enter the target address to send the funds to',
      required: true
    }
  }
}

prompt.get(promptSchema, (err, results) => {
  if (err) {
    console.log(err)
  }

  masterKey = new bitcore.HDPrivateKey(results.hdPrivateKey)
  paths = fs.readFileSync(results.filename).toString().split('\n')
    .filter(line => !!line.length)
  targetAddress = new bitcore.Address(results.targetAddress)

  var addresses = paths.map(path => masterKey.derive(path).privateKey.toAddress())

  var getAddrs = addresses.map(addr => {
    return insightApi.getUtxo(addr)
  })

  Promise.all(getAddrs)
    .then(results => {
      let utxos = [].concat.apply([], results.map(result => {
        return result.map(txref => {
          return bitcore.Transaction.UnspentOutput({
            address: result.address,
            outputIndex: txref.vout,
            satoshis: txref.satoshis,
            scriptPubKey: txref.scriptPubKey,
            txid: txref.txid
          })
        })
      }))

      console.log('Unspent outputs', utxos)

      if (utxos.length > 0) {
        let tx = new bitcore.Transaction()
        tx.from(utxos)
        tx.change(targetAddress)

        paths.map(path => tx.sign(masterKey.derive(path).privateKey))

        let hex = tx.serialize()

        return insightApi.postTx(hex)
      } else {
        return Promise.reject(new Error('No outputs to sweep'))
      }
    }).then(results => {
      console.log('Transaction', results.txid)
    }).catch((err) => {
      console.log(err.message)
    })
})
