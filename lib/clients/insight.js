'use strict'

const config = require('config')
const request = require('request-promise-native')

const url = config.get('insightApiUrl')

const Insight = function () {
  this.url = url.endsWith('/') ? url.slice(0, -1) : url
}

module.exports = Insight

Insight.prototype._get = function (path, params) {
  const urlr = this.url + path
  return request.get({
    url: urlr,
    strictSSL: true,
    json: true,
    qs: params
  })
}

Insight.prototype._post = function (path, params, data) {
  const urlr = this.url + path
  return request.post({
    url: urlr,
    strictSSL: true,
    json: true,
    qs: params,
    body: data
  })
}

Insight.prototype.getTx = function (txid, params = {}) {
  return this._get(`/tx/${txid}`, params)
}

Insight.prototype.getTxs = function (address) {
  return this._get(`/address/${address}/txs`, {})
}

Insight.prototype.getUtxo = function (address) {
  return this._get(`/address/${address}/?unspent=true`, {})
}

Insight.prototype.getBalance = function (address) {
  return this._get(`/address/${address}/balance`, {})
}

Insight.prototype.getEstimateFee = function (nbBlocks) {
  return this._get(`/fee/${nbBlocks}`, {})
}

Insight.prototype.postTx = function (rawTx) {
  return this._post('/tx/send', {}, {rawTx: rawTx})
}
