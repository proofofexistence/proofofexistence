'use strict'

/** Used to estimate docproof tx size. */
const inputSize = 148 // one input size
const pubkeyOutputSize = 34 // pubkey output size
const opReturnSize = 50 // op_return size
const miscSize = 10 // version, nlocktime, input size, output size

/**
 * Estimate the size of a docproof.
 *
 * @private
 * @returns {number} A size in bytes.
 */

function estimateSize () {
  return inputSize + pubkeyOutputSize + opReturnSize + miscSize
}

/**
 * Estimate the fee for a docproof.
 *
 * @param {number} feePerKb Fee per kilobyte.
 * @param {number} [feeMultiplier] Increase the fee estimate by this multiple.
 * @returns {number} A fee estimate in satoshis.
 */

function estimateFee (feePerKb, feeMultiplier = 1) {
  return Math.ceil((estimateSize() / 1000) * feePerKb * feeMultiplier)
}

module.exports = {
  estimateFee
}
