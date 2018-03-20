'use strict'

var bcapi = require('./lib/clients/blockcypher')
var config = require('config')

console.log(config.get('networkName'))

var MAX_HOOKS = 120

bcapi.listHooks()
  .then(data => {
    console.log('found', data.length, 'hooks')
    while (data.length > MAX_HOOKS) {
      var hook = data.shift()
      console.log('deleting', hook.id)
      bcapi.delHook(hook.id).catch(e => { console.log(e.message) })
    }
  }).catch(e => { console.log(e.message) })
