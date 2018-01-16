'use strict'

var bitcore = require('bitcore')
var explorers = require('bitcore-explorers')
var fs = require('fs')
var prompt = require('prompt')
var bluebird = require('bluebird')

var config = require('config')

console.log('network: ', config.get('networkName'))

var insight = new explorers.Insight()
bluebird.promisifyAll(insight)

bluebird.promisifyAll(prompt)

var masterKey, paths, targetAddress, transaction

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

  insight.getUnspentUtxosAsync(addresses, (err, utxos) => {
    if (err) {
      console.log(err)
    } else {
      console.log('Unspent outputs', utxos)

      if (utxos.length > 0) {
        transaction = new bitcore.Transaction()
        transaction.from(utxos)
        transaction.change(targetAddress)

        paths.map(path => transaction.sign(masterKey.derive(path).privateKey))

        insight.broadcast(transaction, (res) => {
          console.log('Done')
        })
      }
    }
  })
})
