'use strict'

const config = require('config')
const request = require('request-promise-native')

const url = config.get('insightUrl')

const SpecialOps = function () {
  const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url
  this.url = baseUrl + '/opcodes'
}

module.exports = SpecialOps

SpecialOps.prototype._get = function (path, params) {
  const urlr = this.url + path
  console.log(urlr)
  return request.get({
    url: urlr,
    strictSSL: true,
    json: true,
    qs: params
  })
}

SpecialOps.prototype._post = function (path, params, data) {
  const urlr = this.url + path
  return request.post({
    url: urlr,
    strictSSL: true,
    json: true,
    qs: params,
    body: data
  })
}

SpecialOps.prototype.getDocproofs = function (hash, params = {}) {
  const prefix = '444f4350524f4f46'
  return this.getMetadata(`${prefix}${hash}`, params)
}

SpecialOps.prototype.getMetadata = function (hash, params = {}) {
  return this._get(`/metadata/${hash}`, params)
}

SpecialOps.prototype.getProtocols = function (params = {}) {
  return this._get(`/protocols`, params)
}
