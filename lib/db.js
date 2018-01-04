'use strict'

var config = require('config')
var level = require('level')

var path = config.get('DB_PATH')

var db = level(path)

module.exports = db
