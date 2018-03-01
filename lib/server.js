'use strict'

var config = require('config')
var core = require('./core')
var db = require('./db')

const app = require('./web')

// routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home', active: { prove: true } })
})
app.get('/about', (req, res) => {
  res.render('about', { title: 'About', active: { about: true } })
})
app.get('/developers', (req, res) => {
  res.render('developers', { title: 'API',
    active: { developers: true },
    hostUrl: config.get('hostUrl'),
    documentPrice: config.get('documentPrice')
  })
})
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', active: { contact: true } })
})
app.get('/detail/:hash', (req, res) => {
  res.render('detail', {
    title: 'Document Information',
    active: { prove: true },
    documentPriceMbtc: core.docproof.priceUnit.toMilis()
  })
})
app.get('/news', (req, res) => {
  res.render('news', { title: 'News', active: { news: true } })
})

app.get('/alldb/:magicNumber', (req, res) => {
  db.createReadStream({})
    .on('data', data => {
      res.write(data.key + ' ' + data.value + '\n')
    })
    .on('error', () => null)
    .on('close', () => null)
    .on('end', () => {
      res.end()
    })
})

app.post('/sweep/:magicNumber', function (req, res) {
  var paths = ''
  var writeOps = []

  db.createReadStream({
    gt: 'pending-sweep',
    lt: 'pending-sweep~'
  })
    .on('data', data => {
      paths += data.value + '\n'
      writeOps.push({
        type: 'del',
        key: data.key
      })
      writeOps.push({
        type: 'put',
        key: 'swept-' + data.key,
        value: data.value
      })
    })
    .on('error', () => null)
    .on('close', () => null)
    .on('end', () => {
      db.batch(writeOps, (err) => {
        if (err) {
          console.log('Error while fetching txs', err)
        } else {
          res.send(paths).end()
        }
      })
    })
})

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
module.exports.stop = stop
