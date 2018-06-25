const config = require('config')
const core = require('../../lib/core')

const packageFile = require('../../package.json')

// parse config
const social = config.get('social')
const defaultChain = config.get('app.defaultChain')
const defaultNetwork = config.get('app.defaultNetwork')
const isTestnet = defaultNetwork === 'testnet'

// GET /api
const version = (req, res, next) =>
  res.send({
    apiVersion: 1.0,
    name: packageFile.name,
    version: packageFile.version
  })

async function configInfo (req, res, next) {
  // the price is a bitcore Unit,
  // and will appear as, e.g. {"amount":0.0005,"code":"BTC"}
  const docproofPrice = await core.notary.docproofPrice()

  res.send({
    apiVersion: 1.0,
    version: packageFile.version,
    social,
    isTestnet,
    defaultChain,
    defaultNetwork,
    docproofPrice,
    ...config.get('app.site')
  })
}

const catch404 = (req, res) =>
  res.status(404)        // HTTP status 404: NotFound
      .send('Not found')

module.exports = {
  configInfo,
  version,
  catch404
}
