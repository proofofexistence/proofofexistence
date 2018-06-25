'use strict'

var defer = require('config/defer').deferConfig

var config = {}

/**
 * Configure app
 */

config.app = {
  site: {
    description: defer(function () {
      return `${this.app.site.slogan}. ${this.app.site.tagline}.`
    })
  }
}

/**
 * Configure Insight.
 */

config.insightUrl = defer(function () {
  const defaultChain = this.app.defaultChain
  const defaultNetwork = this.app.defaultNetwork

  const insight = this.services.insight
  const url = insight[defaultChain][defaultNetwork].url
  return url
})

config.insightApiUrl = defer(function () {
  const defaultChain = this.app.defaultChain
  const defaultNetwork = this.app.defaultNetwork

  const insight = this.services.insight
  const url = insight[defaultChain][defaultNetwork].url
  const api = insight[defaultChain][defaultNetwork].api

  return url + api
})

/**
 * Configure the server.
 */

config.hostUrl = defer(function () {
  let url = this.app.url
  let port = parseInt(url.port)
  return url.scheme + '://' + url.host + (port === 80 || port === 443 ? '' : ':' + port)
})

config.testUrl = defer(function () {
  let url = this.app.url
  let port = parseInt(url.port)
  return url.scheme + '://test.' + url.host + (port === 80 || port === 443 ? '' : ':' + port)
})

/**
 * Function to generate random bytes.
 */

config.crypto = {
  randomBytes: function (size) {
    var crypto = require('crypto')
    return crypto.randomBytes(size)
  }
}

module.exports = config
