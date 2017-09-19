import dotenv from 'dotenv'
import bitcore from 'bitcore'

/**
 * Configure dotenv.
 */

dotenv.config()

/**
 * Configure keys and tokens.
 */

//bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
var BLOCKCYPHER_TOKEN = process.env.BLOCKCYPHER_TOKEN
var MAGIC_NUMBER = process.env.MAGIC_NUMBER

var BASE_PRIVATE_KEY
var TARGET_PAYMENT_ADDRESS

var FEE_MULTIPLIER = 2;

if (bitcore.Networks.defaultNetwork === bitcore.Networks.testnet) {
  // testnet
  BASE_PRIVATE_KEY = new bitcore.HDPrivateKey('tprv8ZgxMBicQKsPdszvXbPSpXmKEK91ByhshMrzNyNTf1fCjiha8enbcQDsA4X6kMGbQh4WvXNuCiw1CvEtQ3nPNuNa64q7GbyhEoLMGfkpCCv')
    //tprv8ZgxMBicQKsPeY4ngsbfgx3TRFqKbV4A9BnaTjH8w6CUeeiNzkNcZ5GKJcRzQU2LjwNeumRaFUa5rhAatQdbpXFzvKojjpPg6tYQwDQFYm 
  TARGET_PAYMENT_ADDRESS = new bitcore.HDPublicKey('tpubD6NzVbkrYhZ4Y16aaXGG6MhZzHMFkpF4iVPMkFKSMMzsV8y9d9CCjZtBUku2K1o4Dn7KdztQV9rbaqVNhE6GbpXFzvKojjpPg6tYQwDQFYm')
} else {
  // livenet
  BASE_PRIVATE_KEY = new bitcore.HDPrivateKey(process.env.BITCOIN_HD_PRIVATE_KEY)
  TARGET_PAYMENT_ADDRESS = new bitcore.HDPublicKey(process.env.BITCOIN_HD_PUBLIC_KEY)
}

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
