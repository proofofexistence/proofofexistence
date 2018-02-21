'use strict'

const _ = require('lodash')

/**
 * Create a higher order function to check if an address is an input or an
 * output.
 */

function isAddressAnCPoint (inOrOut) {
  // FIXME: The function expects a blockcypher tx payload.
  return (address, transaction) => {
    return _.chain(transaction)
      .get(inOrOut)
      .flatMap('addresses')
      .includes(address)
      .value()
  }
}

/**
 * Check if an address is an input of a transaction.
 */

const isAddressAnInput = isAddressAnCPoint('inputs')

/**
 * Check if an address is an output of a transaction.
 */

const isAddressAnOutput = isAddressAnCPoint('outputs')

module.exports = {
  isAddressAnInput,
  isAddressAnOutput
}
