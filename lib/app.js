'use strict'

var config = require('config')
var db = require('./db')

const express = require('express')
const path = require('path')
const logger = require('morgan');

const app = express()

app.use(express.static('public'))
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
const api = require('./routes');
const status = require('./routes/status');
const registration = require('./routes/registration');
const internal = require('./routes/internal');
const admin = require('./routes/admin');

app.use('/api/v1/status', status);
app.use('/api/v1/register', registration);
app.use('/api/internal/latest', internal)
app.use('/api/admin', admin)
app.use('/api', api);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname,'public/index.html'))
})

var server = app.listen(config.get('app.port'), function () {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})

function stop () {
  server.close()
  db.close()
}

module.exports = server
