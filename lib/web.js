'use strict'

const config = require('config')
const express = require('express')
const path = require('path')
const hbs = require('hbs')

const controllers = require('./web/controllers')

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
app.locals.social = config.get('social')
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

// routes

app.get('/', controllers.frontendController.home)
app.get('/about', controllers.frontendController.about)
app.get('/developers', controllers.frontendController.developers)
app.get('/contact', controllers.frontendController.contact)
app.get('/detail/:hash', controllers.frontendController.detail)
app.get('/news', controllers.frontendController.news)
app.post('/search', controllers.frontendController.search)
app.get('/search', controllers.frontendController.search)

// api routes

app.post('/api/v1/register/', (req, res) => {
  req.params.hash = req.body.d
  controllers.registrationController.create(req, res)
})

app.get('/api/v1/status', (req, res) => {
  req.params.hash = req.query.d
  controllers.statusController.show(req, res)
})

app.get('/api/v1/status/:hash', controllers.statusController.show)

app.post('/api/v1/status/', (req, res) => {
  req.params.hash = req.body.hash || req.body.d
  controllers.statusController.update(req, res)
})

app.get('/api/internal/latest/confirmed', controllers.apiInternalController.confirmed)
app.get('/api/internal/latest/unconfirmed', controllers.apiInternalController.unconfirmed)

// webhook routes

app.post('/unconfirmed/:magicNumber/:address', controllers.addressHookController.unconfirmed)
app.post('/confirmed/:magicNumber/:address', controllers.addressHookController.confirmed)

// admin routes

app.get('/alldb/:magicNumber', controllers.adminController.alldb)
app.get('/sweep/:magicNumber', controllers.adminController.sweep)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.status = err.status
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
