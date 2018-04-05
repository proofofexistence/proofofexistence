'use strict'

var bitcore = require('bitcore-lib')
var defer = require('config/defer').deferConfig

var config = {}

/**
 * Configure app
 */

config.app = {
  site: {
    description: defer(function () {
      return `${this.app.site.slogan}. ${this.app.site.tagline}.`
    })
  }
}

/**
 * Configure network
 */

var bitcoinNetwork = process.env.BITCOIN_NETWORK

if (bitcoinNetwork) {
  bitcore.Networks.defaultNetwork = bitcore.Networks[bitcoinNetwork]
} else {
  bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
}

config.currencies = defer(function () {
  let bitcoinNetworks = {}

  bitcoinNetworks[bitcoinNetwork] = {
    incomingPrivateKey: process.env.BITCOIN_HD_PRIVATE_KEY,
    outgoingPublicKey: process.env.BITCOIN_HD_PUBLIC_KEY,
    documentPrice: parseInt(process.env.DOCUMENT_PRICE),
    feeMultiplier: parseFloat(process.env.FEE_MULTIPLIER || 2)
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

config.documentPrice = defer(function () {
  let btc = this.currencies.btc
  let documentPrice = btc.networks[btc.defaultNetwork].documentPrice
  return documentPrice
})

config.feeMultiplier = defer(function () {
  let btc = this.currencies.btc
  let documentPrice = btc.networks[btc.defaultNetwork].feeMultiplier
  return documentPrice
})

/**
 * Configure Insight.
 */

config.insightUrl = defer(function () {
  const btc = this.currencies.btc
  const insight = this.services.insight
  const url = insight[btc.defaultNetwork].url
  return url
})

config.insightApiUrl = defer(function () {
  const btc = this.currencies.btc
  const insight = this.services.insight
  const network = insight[btc.defaultNetwork]
  const url = network.url + network.api
  return url
})

/**
 * Configure the server.
 */

config.hostUrl = defer(function () {
  let url = this.app.url
  let port = parseInt(url.port)
  return url.scheme + '://' + url.host + (port === 80 || port === 443 ? '' : ':' + port)
})

config.testUrl = defer(function () {
  let url = this.app.url
  let port = parseInt(url.port)
  return url.scheme + '://test.' + url.host + (port === 80 || port === 443 ? '' : ':' + port)
})

config.networkName = bitcore.Networks.defaultNetwork.name === 'testnet' ? 'test3' : 'main'

/**
 * Function to generate random bytes.
 */

config.crypto = {
  randomBytes: function (size) {
    var crypto = require('crypto')
    return crypto.randomBytes(size)
  }
}

module.exports = config
