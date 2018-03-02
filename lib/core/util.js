'use strict'

var moment = require('moment')

/**
 * Format a date, or return an empty string if undefined.
 */

function formatDate (date) {
  return date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : ''
}

module.exports = {
  formatDate
}
