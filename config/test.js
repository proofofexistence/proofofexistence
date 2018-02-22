'use strict'

var config = {}

/**
 * Function to generate a list of bytes for testing.
 */

config.crypto = {
  randomBytes: function (size) {
    return Buffer.from(new Array(size).fill(0))
  }
}

module.exports = config
