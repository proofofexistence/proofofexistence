'use strict'

const config = require('config')
const bitcore = require('bitcore-lib')
const Unit = bitcore.Unit

/**
 * A bitcore Unit for the Docproof price
 *
 * @returns {Unit} A bitcore currency unit
 */

const priceUnit = Unit.fromSatoshis(config.get('documentPrice'))

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

/**
 * Create a new transaction for a docproof.
 *
 * @param {string} digest Docproof hash.
 * @param {UnspentOutput[]} outputs Unspent outputs.
 * @param {PrivateKey} signKey Private signing key.
 * @param {Address} changeAddress Change address.
 * @param {number} feePerKb Fee per kilobyte.
 * @param {number} [feeMultiplier] Increase the fee estimate by this multiple.
 * @returns {Transaction} A transaction.
 */

function createTransaction (digest, outputs, signKey, changeAddress, feePerKb, feeMultiplier = 1) {
  let tx = new bitcore.Transaction()

  outputs.map(output => tx.from(output))

  let available = outputs.reduce((acc, output) => acc + output.satoshis, 0)
  let feeEstimate = estimateFee(feePerKb, feeMultiplier)

  let fee = feeEstimate > available ? available : feeEstimate

  tx.addData(bitcore.util.buffer.concat([Buffer.from('DOCPROOF'), Buffer.from(digest, 'hex')]))
  tx.change(changeAddress)
  tx.fee(fee)
  tx.sign(signKey)

  return tx
}

/**
 * Validates a Docproof digest
 *
 * @param {string} hash Document digest.
 * @returns {boolean}
 */

function isValidDigest (hash) {
  return bitcore.util.js.isHexa(hash) && hash.length === 64
}

module.exports = {
  createTransaction,
  estimateFee,
  isValidDigest,
  priceUnit
}
