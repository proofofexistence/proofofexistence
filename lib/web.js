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
app.locals.hostUrl = config.get('hostUrl')
app.locals.testUrl = config.get('testUrl')
app.locals.url = config.get('app.url')
app.locals.social = config.get('social')
app.locals.year = new Date().getFullYear()

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

// api routes
const api = require('./routes');
const status = require('./routes/status');
const registration = require('./routes/registration');
const internal = require('./routes/internal');
const admin = require('./routes/admin');

app.use('/api/v1', api);
app.use('/api/v1', status);
app.use('/api/v1', registration);
app.use('/api/internal/latest', internal)
app.use('/api/admin', admin)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname,'public/index.html'))
})

module.exports = app
