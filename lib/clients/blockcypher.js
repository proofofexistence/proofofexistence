'use strict'

const config = require('config')
const Bcypher = require('@poexio/blockcypher')

const coin = 'btc'
const chain = config.get('networkName')
const token = config.get('services.blockcypher.token')
const url = config.get('services.blockcypher.url')

const blockcypher = new Bcypher(coin, chain, token, url)

module.exports = blockcypher
