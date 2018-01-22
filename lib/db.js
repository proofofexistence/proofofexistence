'use strict'

var config = require('config')
var level = require('level')

var path = config.get('db.path')

var db = level(path)

function destroy () {
  db.close()
  level.destroy(path)
}

module.exports = db
module.exports.destroy = destroy
