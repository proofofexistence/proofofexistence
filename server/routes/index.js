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

router.get('/*', function(req, res) {
  res.status(404)        // HTTP status 404: NotFound
      .send('Not found');
});

module.exports = router;
