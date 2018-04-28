'use strict'

var config = require('config')

const express = require('express')
const path = require('path')
const logger = require('morgan');

const app = express()

app.use(express.static(path.resolve(__dirname,'../ui/public')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const env = process.env.NODE_ENV || 'development';
if(env == 'development') app.use(logger('dev'));

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
const router = express.Router();
const api = require('./routes');
const status = require('./routes/status');
const registration = require('./routes/registration');
const { confirmed, unconfirmed } = require('./routes/internal');
const admin = require('./routes/admin');

app.use('/api/v1/status', status);
app.use('/api/v1/register', registration);
app.use('/api/admin', admin)

app.use('/api/internal/latest/confirmed', confirmed)
app.use('/api/internal/latest/unconfirmed', unconfirmed)

app.use('/api', api);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname,'../ui/public/index.html'))
})

var server = app.listen(config.get('app.port'), function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})

module.exports = server
