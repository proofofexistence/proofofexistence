'use strict'

var dotenv = require('dotenv')
var bitcore = require('bitcore-lib')
var fs = require('fs')
var path = require('path')
var defer = require('config/defer').deferConfig;

var config = {}

/**
 * Configure dotenv.
 */

// Use .env, or .env.$NODE_ENV if it exists
var envDir = path.resolve(__dirname, '../')
var envPath = path.join(envDir, '.env')
var nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'
var nodeEnvPath = envPath + '.' + nodeEnv

if (fs.existsSync(nodeEnvPath)) {
  envPath = nodeEnvPath
}

dotenv.config({path: envPath})

/**
 * Configure network
 */

var bitcoinNetwork = process.env.BITCOIN_NETWORK

if (bitcoinNetwork) {
  bitcore.Networks.defaultNetwork = bitcore.Networks[bitcoinNetwork]
} else {
  bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
}

config.currencies = defer(function() {
  let bitcoinNetworks = {}

  bitcoinNetworks[bitcoinNetwork] = {
    incomingPrivateKey: process.env.BITCOIN_HD_PRIVATE_KEY,
    outgoingPublicKey: process.env.BITCOIN_HD_PUBLIC_KEY,
    documentPrice: parseInt(process.env.DOCUMENT_PRICE),
    feeMultiplier: parseInt(process.env.FEE_MULTIPLIER || 2)
  }

  return {
    btc: {
      defaultNetwork: bitcoinNetwork,
      networks: bitcoinNetworks
    }
  }
})

/**
 * Configure prices.
 */

config.documentPrice = defer(function() {
  let btc = this.currencies.btc
  let documentPrice = btc.networks[btc.defaultNetwork].documentPrice
  return documentPrice
})

config.feeMultiplier = defer(function() {
  let btc = this.currencies.btc
  let documentPrice = btc.networks[btc.defaultNetwork].feeMultiplier
  return documentPrice
})

/**
 * Configure the server.
 */

config.hostUrl = defer(function() {
  let url = this.app.url
  let port = parseInt(url.port)
  return url.scheme + '://' + url.host + (port === 80 || port === 443 ? '' : ':' + port)
})

config.networkName = bitcore.Networks.defaultNetwork.name === 'testnet' ? 'test3' : 'main'

/**
 * Function to generate random bytes.
 */

config.crypto = {
  randomBytes: function(size) {
    var crypto = require('crypto');
    return crypto.randomBytes(size);
  }
}

module.exports = config
