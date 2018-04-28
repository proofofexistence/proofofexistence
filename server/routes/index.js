const express = require('express');
const router = express.Router();
const package = require('../../package.json');

const config = require('config')

// parse config
const social = config.get('social')
const defaultNetwork = config.get('currencies').btc.defaultNetwork
const isTestnet = defaultNetwork === "testnet"

// GET /api
const version = (req, res, next) =>
  res.send({
    apiVersion : 1.0,
    name : package.name,
    version : package.version
  })

const configInfo = (req, res, next) =>
  res.send({
    apiVersion : 1.0,
    version : package.version,
    social,
    isTestnet,
    defaultNetwork,
    ...config.get('app')
  })

const catch404 = (req, res) =>
  res.status(404)        // HTTP status 404: NotFound
      .send('Not found');

module.exports = {
  configInfo,
  version,
  catch404
}
