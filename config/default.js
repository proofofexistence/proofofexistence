'use strict'

var dotenv = require('dotenv')
var bitcore = require('bitcore')
var fs = require('fs')
var path = require('path')

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
} else if (nodeEnv === 'test') {
  bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
}

var btc = {
  wallet: {
    incoming: {
      privateKey: process.env.BITCOIN_HD_PRIVATE_KEY
    },
    outgoing: {
      publicKey: process.env.BITCOIN_HD_PUBLIC_KEY
    }
  }
}

config.btc = btc

/**
 * Configure keys and tokens.
 */

config.BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN

config.MAGIC_NUMBER = process.env.MAGIC_NUMBER

/**
 * Configure prices.
 */

config.DOCUMENT_PRICE = parseInt(process.env.DOCUMENT_PRICE)

config.FEE_MULTIPLIER = parseInt(process.env.FEE_MULTIPLIER || 2)

/**
 * Configure the database.
 */

config.DB_PATH = process.env.DB_PATH

/**
 * Configure mail.
 */

config.MAIL_FROM = process.env.MAIL_FROM
config.MAIL_TO = process.env.MAIL_TO
config.MAIL_USER = process.env.GMAIL_USER
config.MAIL_PASS = process.env.GMAIL_PASS

/**
 * Configure the server.
 */

config.PORT = normalizePort(process.env.PORT || '3003')
config.HOST = process.env.HOST
config.HOST_URL = normalizeHostUrl(
  process.env.HOST_SCHEME,
  process.env.HOST,
  process.env.HOST_PORT
)
config.networkName = bitcore.Networks.defaultNetwork.name === 'testnet' ? 'test3' : 'main'

/**
 * Normalize host from a scheme, host, and port
 */

function normalizeHostUrl (scheme, host, port) {
  return scheme + '://' + host + (port === 80 || port === 443 ? '' : ':' + port)
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

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
