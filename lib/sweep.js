'use strict'

var bitcore = require('bitcore-lib')
var fs = require('fs')
var prompt = require('prompt')
var config = require('config')
var blockcypher = require('../lib/clients/blockcypher')

console.log('network: ', config.get('networkName'))

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
    return blockcypher.getAddr(addr, { unspentOnly: true, includeScript: true })
  })

  Promise.all(getAddrs)
    .then(results => {
      let utxos = [].concat.apply([], results.map(result => {
        let confirmedTxs = result.txrefs || []
        let unconfirmedTxs = result.unconfirmed_txrefs || []

        let txrefs = confirmedTxs.concat(unconfirmedTxs)

        return txrefs.map(txref => {
          return bitcore.Transaction.UnspentOutput({
            address: result.address,
            outputIndex: txref.tx_output_n,
            satoshis: txref.value,
            scriptPubKey: txref.script,
            txid: txref.tx_hash
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

        return blockcypher.pushTX(hex)
      } else {
        return Promise.reject(new Error('No outputs to sweep'))
      }
    }).then(results => {
      console.log('Transaction', results.tx.hash)
    }).catch((err) => {
      console.log(err.message)
    })
})
