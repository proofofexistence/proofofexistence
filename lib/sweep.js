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

console.log('Please enter the master extended private key to use')

prompt.getAsync(['hdPrivateKey']).then(results => {
  masterKey = new bitcore.HDPrivateKey(results.hdPrivateKey)
  console.log('Please enter the name of the file with the derivation paths')
  return prompt.getAsync(['filename'])
}).then(results => {
  paths = fs.readFileSync(results.filename).toString().split('\n')
    .filter(line => !!line.length)
  console.log('Please enter the target address to send the funds to')
  return prompt.getAsync(['targetAddress'])
}).then(results => {
  targetAddress = new bitcore.Address(results.targetAddress)

  var addresses = paths.map(path => masterKey.derive(path).privateKey.toAddress())

  return insight.getUnspentUtxosAsync(addresses)
}).then(utxos => {
  console.log(utxos)
  transaction = new bitcore.Transaction()
  transaction.from(utxos)
  transaction.change(targetAddress)

  paths.map(path => transaction.sign(masterKey.derive(path).privateKey))

  insight.broadcast(transaction, function () {
    console.log(arguments)
  })
}).catch(e => {
  console.log(e, e.stack)
})
