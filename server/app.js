'use strict'

var config = require('config')

const express = require('express')
const path = require('path')
const logger = require('morgan')

const app = express()

app.use(express.static(path.resolve(__dirname, '../ui/public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const env = process.env.NODE_ENV || 'development'
if (env === 'development') app.use(logger('dev'))

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
const { configInfo, version, catch404 } = require('./routes')
const { create, show, update } = require('./routes/actions')
const { docproofs } = require('./routes/docproofs')
const { confirmed, unconfirmed } = require('./routes/internal')
const { alldb, sweep, dbClose } = require('./routes/admin')

app.get('/api', (req, res) => res.send({}))
app.get('/api/v1', version)
app.get('/api/v1/config', configInfo)
app.get('/api/v1/status/', show) // status resource that accepts a query parameter
app.get('/api/v1/status/:hash', show)
app.post('/api/v1/status/', update)
app.post('/api/v1/register', create)
app.get('/api/v1/docproofs/:hash', docproofs)
app.get('/alldb/:magicNumber', alldb)
app.get('/sweep/:magicNumber', sweep)
app.get('/api/internal/latest/confirmed', confirmed)
app.get('/api/internal/latest/unconfirmed', unconfirmed)

app.get('api/*', catch404)

// send static file and handle routes client-side with react
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../ui/public/index.html'))
})

var server = app.listen(config.get('app.port'), function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Proof of Existence listening at http://%s:%s', host, port)
})

const stop = () => {
  server.close()
  dbClose()
}

module.exports = server
module.exports.stop = stop
