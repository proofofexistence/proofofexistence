
import bitcore from 'bitcore'

// TODO: Change these and move to ENV variables

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet
var BLOCKCYPHER_TOKEN = '327387b19e8148c2aea563935eb6cde3'
var MAGIC_NUMBER = 'UsblXqKxH8wzEdFPRUwru2xqCztrhJcJrxQWTR9fLI'

var BASE_PRIVATE_KEY
var TARGET_PAYMENT_ADDRESS




if (bitcore.Networks.defaultNetwork === bitcore.Networks.testnet) {
  // testnet
  BASE_PRIVATE_KEY = new bitcore.HDPrivateKey('tprv8ZgxMBicQKsPdszvXbPSpXmKEK91ByhshMrzNyNTf1fCjiha8enbcQDsA4X6kMGbQh4WvXNuCiw1CvEtQ3nPNuNa64q7GbyhEoLMGfkpCCv')
    //tprv8ZgxMBicQKsPeY4ngsbfgx3TRFqKbV4A9BnaTjH8w6CUeeiNzkNcZ5GKJcRzQU2LjwNeumRaFUa5rhAatQdbpXFzvKojjpPg6tYQwDQFYm 
  TARGET_PAYMENT_ADDRESS = new bitcore.HDPublicKey('tpubD6NzVbkrYhZ4Y16aaXGG6MhZzHMFkpF4iVPMkFKSMMzsV8y9d9CCjZtBUku2K1o4Dn7KdztQV9rbaqVNhE6GbpXFzvKojjpPg6tYQwDQFYm')
} else {
  // livenet
  BASE_PRIVATE_KEY = new bitcore.HDPrivateKey('xprv9s21ZrQH143K2sSwfiim5eT9AtcXPJw2ZcpUVyoeBEc9vWX7GMewLBQxv2iTWpYYCbWvkaMVwvaDCR6EGhaDDyM3vGFsTY2g35fLfTGCjr7')
  TARGET_PAYMENT_ADDRESS = new bitcore.HDPublicKey('xpub661MyMwAqRbcG7ihktKz8TrGScA83Caw2n8DivtKDTj1ornJ9tJpwDJMmGnKLip5XMom873npGF27nuWbsjAm9HjKgPCjomr6cHpLes7dGW')
}


var SERVER_URL = 'https://smartcontractsolutions.com/poe/'
var networkName = bitcore.Networks.defaultNetwork.name === 'testnet' ? 'test3' : 'main';

var DEBUG = true


export {
  BLOCKCYPHER_TOKEN,
  MAGIC_NUMBER,
  BASE_PRIVATE_KEY,
  TARGET_PAYMENT_ADDRESS,
  SERVER_URL,
  networkName,
  DEBUG
}
