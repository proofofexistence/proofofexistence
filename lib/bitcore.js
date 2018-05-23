'use strict'

const config = require('config')
const bitcore = require('bitcore-lib')

const defaultNetwork = config.get('app.defaultNetwork')

if (defaultNetwork) {
  bitcore.Networks.defaultNetwork = bitcore.Networks[defaultNetwork]
} else {
  bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
}

module.exports = bitcore
