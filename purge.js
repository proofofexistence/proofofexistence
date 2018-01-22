'use strict'

var bcypher = require('blockcypher')
var config = require('config')

console.log(config.get('networkName'))

var MAX_HOOKS = 120
var BCypher = bcypher
var bcapi = new BCypher('btc', config.get('networkName'), config.get('services.blockcypher.token'))
function printResponse (err, data) {
  if (err !== null) {
    console.log(err)
  } else {
    console.log(data)
  }
}

bcapi.listHooks(function (err, data) {
  if (err !== null) {
    console.log(err)
  } else {
    console.log('found', data.length, 'hooks')
    while (data.length > MAX_HOOKS) {
      var hook = data.shift()
      console.log('deleting', hook.id)
      bcapi.delHook(hook.id, printResponse)
    }
  }
})
