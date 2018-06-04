'use strict'

const config = require('config')
const core = require('../core')
const store = require('../store')

const chains = require('../chains')
const bitcore = chains.get()
const _ = require('lodash')

const incomingHDPrivateKey = new bitcore.HDPrivateKey(chains.incomingPrivateKey())

/**
 * Perform a document registration.
 */

const register = async (hash) => {
  const docAddress = await store.getDigestAddress(hash)

  if (docAddress) {
    return existingRegistration(hash)
  } else {
    const randomPath = core.wallet.getRandomPath()
    const paymentAddress = incomingHDPrivateKey.derive(randomPath).privateKey.toAddress()

    const registration = newRegistration(hash, randomPath, paymentAddress)

    if (registration.fee > config.get('documentPrice')) {
      console.log('We should increase the price!', config.get('documentPrice'), 'vs', registration.fee)
      registration.fee = config.get('documentPrice') - 1
    }

    await store.putDigestAddress(hash, paymentAddress)
    await store.putDocproof(paymentAddress, registration)

    // TODO: Webhooks should be created here.

    const unconfirmed = _.omit(registration, 'path')
    store.addLatestUnconfirmed(unconfirmed)

    return paymentDetails(hash, paymentAddress)
  }
}

/**
 * Reply body if a document is already registered.
 */

function existingRegistration (hash) {
  return {
    'success': false,
    'reason': 'existing',
    'digest': hash
  }
}

/**
 * A new document registration.
 */

function newRegistration (hash, childKeyPath, address) {
  const feePerKilobyte = bitcore.Transaction.FEE_PER_KB
  const fee = core.docproof.estimateFee(feePerKilobyte, config.get('feeMultiplier'))

  return {
    digest: hash,
    path: childKeyPath,
    payment_address: address.toString(),
    pending: true,
    timestamp: new Date(),
    feePerKilobyte: feePerKilobyte,
    fee: fee
  }
}

/**
 * Reply body for a new registration.
 */

function paymentDetails (hash, address) {
  return {
    success: 'true',
    digest: hash,
    pay_address: address.toString(),
    price: config.get('documentPrice')
  }
}

module.exports = register
