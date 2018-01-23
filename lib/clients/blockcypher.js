'use strict'

const config = require('config')
const Util = require('util')
const Bcypher = require('blockcypher')

const coin = 'btc'
const chain = config.get('networkName')
const token = config.get('services.blockcypher.token')

const bcapi = new Bcypher(coin, chain, token)

var blockcypher = {}

blockcypher.getChain = function () {
  return Util.promisify(bcapi.getChain.bind(bcapi))()
}

blockcypher.getAddr = function (addr, params) {
  return Util.promisify(bcapi.getAddr.bind(bcapi))(addr, params)
}

blockcypher.getAddrFull = function (addr, params) {
  return Util.promisify(bcapi.getAddrFull.bind(bcapi))(addr, params)
}

blockcypher.pushTX = function (hex) {
  return Util.promisify(bcapi.pushTX.bind(bcapi))(hex)
}

blockcypher.createHook = function (data) {
  return Util.promisify(bcapi.createHook.bind(bcapi))(data)
}

module.exports = blockcypher
