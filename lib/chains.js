'use strict'

const config = require('config')

const bitcoreLib = require('bitcore-lib')
const bitcoreLibCash = require('bitcore-lib-cash')

const chains = config.get('chains')
const defaultChain = config.get('app.defaultChain')
const defaultNetwork = config.get('app.defaultNetwork')

const networkConfig = chains[defaultChain].networks[defaultNetwork]

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

function chain () {
  return defaultChain
}

function network () {
  return defaultNetwork
}

function incomingPrivateKey () {
  return networkConfig.incomingPrivateKey
}

function outgoingPublicKey () {
  return networkConfig.outgoingPublicKey
}

function documentPrice () {
  return networkConfig.documentPrice ? networkConfig.documentPrice : 0
}

function feeMultiplier () {
  return networkConfig.feeMultiplier ? networkConfig.feeMultiplier : 1
}

module.exports = {
  get,
  chain,
  network,
  incomingPrivateKey,
  outgoingPublicKey,
  documentPrice,
  feeMultiplier
}
