'use strict'

const chains = require('../chains')
const bitcore = chains.get()
const Unit = bitcore.Unit
const Big = require('big.js')

/**
 * A bitcore Unit for the Docproof price
 *
 * @returns {Unit} A bitcore currency unit
 */

function price () {
  return Unit.fromSatoshis(chains.documentPrice())
}

/**
 * A bitcore Unit for the Docproof price based on the estimated fee
 *
 * @param {number} feePerKb Fee per kilobyte in satoshis.
 * @param {number} [feeMultiplier] Increase the fee estimate by this multiple.
 * @returns {Unit} A bitcore currency unit
 */

function adjustedPrice (feePerKb, feeMultiplier = 1) {
  const fee = estimateFee(feePerKb, feeMultiplier)
  const mbtcFee = new Big(Unit.fromSatoshis(fee).toMilis())
  const step = new Big(0.25) // round up to the nearest 0.x mBTC
  const remainder = mbtcFee.mod(step)
  let mbtcPrice = mbtcFee

  if (remainder.gt(0)) {
    mbtcPrice = mbtcFee.minus(remainder).plus(step)
  }

  return Unit.fromMilis(mbtcPrice)
}

/** Used to estimate docproof tx size. */
const inputSize = 148 // one input size
const pubkeyOutputSize = 34 // pubkey output size
const opReturnSize = 50 // op_return size
const miscSize = 10 // version, nlocktime, input size, output size
const safeAmount = 600 // https://github.com/bitpay/bitcore-lib/blob/master/lib/transaction/transaction.js#L66

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
 * @param {number} feePerKb Fee per kilobyte in satoshis.
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
  available = available - safeAmount
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
  adjustedPrice,
  createTransaction,
  estimateFee,
  isValidDigest,
  price
}
