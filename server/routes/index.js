const express = require('express');
const router = express.Router();
const package = require('../../package.json');

var config = require('config')

// GET /api
router.get('/', function(req, res, next) {
  res.send({
    name : package.name,
    version : package.version
  });
});

router.get('/v1', function(req, res, next) {
  res.send({
    apiVersion : 1.0
  });
});

const social = config.get('social')
const defaultNetwork = config.get('currencies').btc.defaultNetwork
const isTestnet = defaultNetwork === "testnet"

router.get('/v1/config', function(req, res, next) {
  res.send({
    apiVersion : 1.0,
    version : package.version,
    social,
    isTestnet,
    defaultNetwork,
    ...config.get('app')
  });
});


router.get('/*', function(req, res) {
  res.status(404)        // HTTP status 404: NotFound
      .send('Not found');
});

module.exports = router;
