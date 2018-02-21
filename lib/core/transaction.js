'use strict'

/**
 * Create a higher order function to check if an address is an input or an
 * output.
 */

function isAddressAnCPoint (inOrOut) {
  // FIXME: The function expects a blockcypher tx payload.
  return (address, transaction) => {
    return transaction[inOrOut + 's'] && transaction[inOrOut + 's'].reduce(
      (prev, point) => prev || (point.addresses && point.addresses.reduce(
        (prev, addr) => prev || (addr === address), false
      )), false
    )
  }
}

/**
 * Check if an address is an input of a transaction.
 */

const isAddressAnInput = isAddressAnCPoint('input')

/**
 * Check if an address is an output of a transaction.
 */

const isAddressAnOutput = isAddressAnCPoint('output')

module.exports = {
  isAddressAnInput,
  isAddressAnOutput
}
