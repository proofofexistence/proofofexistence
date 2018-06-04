'use strict'

const config = require('config')

const bitcoreLib = require('bitcore-lib')
const bitcoreLibCash = require('bitcore-lib-cash')

const chains = config.get('chains')
const defaultChain = config.get('app.defaultChain')
const defaultNetwork = config.get('app.defaultNetwork')

const network = chains[defaultChain].networks[defaultNetwork]

let bitcore
switch (defaultChain) {
  case 'bch':
    bitcore = bitcoreLibCash
    break
  default:
    bitcore = bitcoreLib
}

if (defaultNetwork) {
  bitcore.Networks.defaultNetwork = bitcore.Networks[defaultNetwork]
} else {
  bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
}

function get () {
  return bitcore
}

function incomingPrivateKey () {
  return network.incomingPrivateKey
}

function outgoingPublicKey () {
  return network.outgoingPublicKey
}

module.exports = {
  get,
  incomingPrivateKey,
  outgoingPublicKey
}
