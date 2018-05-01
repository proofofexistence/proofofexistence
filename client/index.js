const axios = require('axios')
const logger = require('../scripts/logger')

module.exports = class APIClient {
  constructor (options = {}) {
    logger.debug('Init API client', options)
    this.baseUrl = options.baseUrl
    this.apiVersion = 'v1' || options.apiVersion
  }

  getDocStatus (status) {
    if (status.pending === true && !status.txstamp) {
      return 'paymentRequired'
    } else if (status.txstamp && !status.blockstamp) {
      return 'confirming'
    } else if (status.blockstamp) {
      return 'confirmed'
    }
  }

  // URL parser
  getURL (path, internal = false) {
    const apiPath = internal
      ? `/api/internal/${path}`
      : `/api/${this.apiVersion}/${path}`

    return this.baseUrl ? `${this.baseUrl}${apiPath}` : apiPath
  }

  handleError (error, errorCallback) {
    if (errorCallback && error.response) {
      logger.debug('ERROR : ' + error.response.status)
      if (error.response.status === 403) logger.debug('403')
      // redirect to not authorized page
      // browserHistory.push("unauthorized")

      errorCallback(error.response.data)
    } else throw error
  }

  get (url, callback, errorCallback) {
    logger.debug('GET : ' + url)
    axios.get(url)
      .then(res => {
        var info = res.data
        callback(info)
      })
      .catch((error) => {
        this.handleError(error, errorCallback)
      })
  }

  delete (url, callback, errorCallback) {
    logger.debug('DELETE : ' + url)
    axios.delete(url)
      .then(res => {
        var info = res.data
        callback(info)
      })
      .catch((error) => {
        this.handleError(error, errorCallback)
      })
  }

  post (url, data, callback, errorCallback) {
    logger.debug('POST : ' + url)
    // logger.debug(data);
    axios.post(url, data)
      .then(res => {
        var info = res.data
        callback(info)
      })
      .catch((error) => {
        this.handleError(error, errorCallback)
      })
  }

  /*
  * CONFIG
  */
  getConfig (callback) {
    this.get(this.getURL(`config`), config => {
      logger.debug(config)
      callback(config)
    })
  }

  /*
  * CONFIRMED / UNCONFIRMED
  */
  getLatestConfirmed (callback) {
    this.get(this.getURL(`latest/confirmed`, true), data => {
      callback(data)
    })
  }

  getLatestUnconfirmed (callback) {
    this.get(this.getURL(`latest/unconfirmed`, true), data => {
      callback(data)
    })
  }

  /*
  * CREATE, SHOW, UPDATE based on hash
  */
  register (hash, callback, callbackError) {
    this.post(this.getURL('register'),
      {d: hash},
      path => callback(path),
      error => callbackError(error)
    )
  }

  getStatus (hash, callback) {
    this.get(this.getURL(`status/${hash}`),
      (statusData) => {
        const status = this.getDocStatus(statusData)
        callback(Object.assign({}, statusData, {status}))
      }
    )
  }

  updateStatus (hash, callback, errorCallback) {
    this.post(this.getURL(`status`),
      {d: hash},
      (statusData) => {
        const status = this.getDocStatus(statusData)
        callback(Object.assign({}, statusData, {status}))
      },
      error => errorCallback(error)
    )
  }
}
