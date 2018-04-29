var jsdom = require('jsdom').jsdom
var exposedProperties = ['window', 'navigator', 'document']

process.env.NODE_ENV = 'test'

global.document = jsdom('')
global.navigator = { userAgent: 'node.js' }
global.window = document.defaultView

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property)
    global[property] = document.defaultView[property]
  }
})
