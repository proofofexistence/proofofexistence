'use strict'

const raw = require('config/raw').raw
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

/**
 * Configure keys and tokens.
 */

config.BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN

config.MAGIC_NUMBER = process.env.MAGIC_NUMBER

config.FEE_MULTIPLIER = 2

config.BASE_PRIVATE_KEY = raw(new bitcore.HDPrivateKey(process.env.BITCOIN_HD_PRIVATE_KEY))
config.TARGET_PAYMENT_ADDRESS = raw(new bitcore.HDPublicKey(process.env.BITCOIN_HD_PUBLIC_KEY))

/**
 * Configure prices.
 */

config.DOCUMENT_PRICE = parseInt(process.env.DOCUMENT_PRICE)

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

module.exports = config
