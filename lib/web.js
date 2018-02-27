'use strict'

const config = require('config')
const express = require('express')
const path = require('path')
const hbs = require('hbs')

const bitcore = require('bitcore-lib')

const app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, 'views/partials'))

// set up locals as template data
hbs.localsAsTemplateData(app)
app.locals.isProduction = app.settings.env === 'production'
app.locals.isTest = app.settings.env === 'test'
app.locals.isLivenet = bitcore.Networks.defaultNetwork.name === 'livenet'
app.locals.defaultNetwork = bitcore.Networks.defaultNetwork.name
app.locals.site = config.get('app.site')
app.locals.year = new Date().getFullYear()

// register block and extends view helpers
var blocks = {}
hbs.registerHelper('extend', (name, context) => {
  var block = blocks[name]
  if (!block) {
    block = blocks[name] = []
  }

  block.push(context.fn(this))
})
hbs.registerHelper('block', (name) => {
  var val = (blocks[name] || []).join('\n')

  // clear the block
  blocks[name] = []
  return val
})

// callback triggers to route parameters
app.param('magicNumber', (req, res, next, magicNumber) => {
  if (magicNumber === config.get('app.magicNumber')) {
    next()
  } else {
    let err = new Error('Not Found')
    err.status = 404
    next(err)
  }
})

module.exports = app
