'use strict'

const config = require('config')

const randomBytes = config.get('crypto.randomBytes')

function makeInt (array, offset) {
  let result = 0

  // Hack, make sure not to use hardened keys
  // This just reduces amount of entropy for derivations by N bits if using N integers
  array[offset + 3] = array[offset + 3] >> 1
  for (let i = 0, pow = 1; i < 4; result += array[i + offset] * pow, i++, pow *= 256) {}
  return result
}

/**
 * Generate a random HD child key derivation path.
 *
 * @returns {string} A HD child key path.
 */

function getRandomPath () {
  const random = randomBytes(12)
  return 'm/' + makeInt(random, 0) + '/' + makeInt(random, 4) + '/' + makeInt(random, 8)
}

module.exports = {
  getRandomPath
}
