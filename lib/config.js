import dotenv from 'dotenv'
import bitcore from 'bitcore'
import fs from 'fs'

/**
 * Configure dotenv.
 */

// Use .env, or .env.$NODE_ENV if it exists
var envPath = '.env'
var nodeEnv = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'
var nodeEnvPath = envPath + '.' + nodeEnv

if (fs.existsSync(nodeEnvPath)) {
  envPath = nodeEnvPath
}

dotenv.config({path: envPath})

/**
 * Configure keys and tokens.
 */

if (nodeEnv === 'test') {
  bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
}

var BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN
var MAGIC_NUMBER = process.env.MAGIC_NUMBER

var BASE_PRIVATE_KEY
var TARGET_PAYMENT_ADDRESS

var FEE_MULTIPLIER = 2;

BASE_PRIVATE_KEY = new bitcore.HDPrivateKey(process.env.BITCOIN_HD_PRIVATE_KEY)
TARGET_PAYMENT_ADDRESS = new bitcore.HDPublicKey(process.env.BITCOIN_HD_PUBLIC_KEY)

/**
 * Configure prices.
 */

var DOCUMENT_PRICE = parseInt(process.env.DOCUMENT_PRICE)
var SIGN_PRICE = parseInt(process.env.SIGN_PRICE)

/**
 * Configure the database.
 */

var DB_PATH = process.env.DB_PATH

/**
 * Configure mail.
 */

var MAIL_FROM = process.env.MAIL_FROM
var MAIL_TO = process.env.MAIL_TO
var MAIL_USER = process.env.GMAIL_USER
var MAIL_PASS = process.env.GMAIL_PASS

/**
 * Configure the server.
 */

var PORT = normalizePort(process.env.PORT || '3003')
var HOST = process.env.HOST
var HOST_URL = normalizeHostUrl(
  process.env.HOST_SCHEME,
  process.env.HOST,
  process.env.HOST_PORT
)
var networkName = bitcore.Networks.defaultNetwork.name === 'testnet' ? 'test3' : 'main';

var DEBUG = false

/**
 * Normalize host from a scheme, host, and port
 */

function normalizeHostUrl(scheme, host, port) {
  return scheme + '://' + host  + (port == 80 || port == 443 ? '' : ':' + port)
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

export {
  BLOCKCYPHER_TOKEN,
  MAGIC_NUMBER,
  BASE_PRIVATE_KEY,
  TARGET_PAYMENT_ADDRESS,
  DOCUMENT_PRICE,
  SIGN_PRICE,
  HOST,
  HOST_URL,
  PORT,
  DB_PATH,
  MAIL_FROM,
  MAIL_TO,
  MAIL_USER,
  MAIL_PASS,
  networkName,
  DEBUG,
  FEE_MULTIPLIER
}
