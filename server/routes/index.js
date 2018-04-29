const config = require('config')

const packageFile = require('../../package.json')

// parse config
const social = config.get('social')
const defaultNetwork = config.get('currencies').btc.defaultNetwork
const isTestnet = defaultNetwork === 'testnet'

// GET /api
const version = (req, res, next) =>
  res.send({
    apiVersion: 1.0,
    name: packageFile.name,
    version: packageFile.version
  })

const configInfo = (req, res, next) =>
  res.send({
    apiVersion: 1.0,
    version: packageFile.version,
    social,
    isTestnet,
    defaultNetwork,
    ...config.get('app')
  })

const catch404 = (req, res) =>
  res.status(404)        // HTTP status 404: NotFound
      .send('Not found')

module.exports = {
  configInfo,
  version,
  catch404
}
