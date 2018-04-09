'use strict'

const _ = require('lodash')

/**
 * Check if an address is an input of a transaction.
 */

const isAddressAnInput = function (address, transaction) {
  return _.chain(transaction)
    .get('vin')
    .flatMap('addr')
    .includes(address)
    .value()
}

/**
 * Check if an address is an output of a transaction.
 */

const isAddressAnOutput = function (address, transaction) {
  return _.chain(transaction)
    .get('vout')
    .flatMap('scriptPubKey.addresses')
    .includes(address)
    .value()
}

module.exports = {
  isAddressAnInput,
  isAddressAnOutput
}
