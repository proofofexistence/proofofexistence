'use strict'

var bitcore = require('bitcore-lib')
var _ = require('lodash')

var level = require('level')

var config = require('config')
var core = require('./core')
var docproof = core.docproof
var db = require('./db')
var blockcypher = require('./clients/blockcypher')

const app = require('./web')
const store = require('./store')

var btc = config.get('currencies.btc')
var incomingHDPrivateKey = new bitcore.HDPrivateKey(btc.networks[btc.defaultNetwork].incomingPrivateKey)
var outgoingHDPublicKey = new bitcore.HDPublicKey(btc.networks[btc.defaultNetwork].outgoingPublicKey)

var EXPECTED_CONFIRMATIONS = 1

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

var makeUnconfirmedHook = address => config.get('hostUrl') + '/unconfirmed/' + config.get('app.magicNumber') + '/' + address
var makeConfirmedHook = address => config.get('hostUrl') + '/confirmed/' + config.get('app.magicNumber') + '/' + address

app.get('/api/internal/latest/confirmed', (req, res) => {
  store.getLatestConfirmed().then(results => {
    res.set('Content-Type', 'application/json')
    res.send(results)
  })
})

app.get('/api/internal/latest/unconfirmed', (req, res) => {
  store.getLatestUnconfirmed().then(results => {
    res.set('Content-Type', 'application/json')
    res.send(results)
  })
})

var validateHash = hash => hash && hash.length === 64 && bitcore.util.js.isHexa(hash)

var doRegister = (req, res) => {
  // Sanitize
  if (!validateHash(req.params.hash)) {
    return res.status(400).json({
      reason: 'Invalid `hash` field'
    })
  }

  var hash = req.params.hash
  var randomPath = core.wallet.getRandomPath()
  var address = incomingHDPrivateKey.derive(randomPath).privateKey.toAddress()

  var storeObject = {
    digest: hash,
    path: randomPath,
    payment_address: address.toString(),
    pending: true,
    timestamp: new Date()
  }

  new Promise((resolve, reject) => {
    db.get('map-' + hash)
      .then(address => {
        res.json({
          'success': false,
          'reason': 'existing',
          'digest': hash
        })
      })
      .catch(() => {
        // a database miss generates a new record
        resolve()
      })
  }).then(result => {
    storeObject.feePerKilobyte = bitcore.Transaction.FEE_PER_KB
    storeObject.fee = docproof.estimateFee(storeObject.feePerKilobyte, config.get('feeMultiplier'))

    if (storeObject.fee > config.get('documentPrice')) {
      console.log('We should increase the price!', config.get('documentPrice'), 'vs', storeObject.fee)
      storeObject.fee = config.get('documentPrice') - 1
    }

    return db.put(address.toString(), JSON.stringify(storeObject))
  }).then(result => {
    return blockcypher.createHook({
      event: 'unconfirmed-tx',
      address: address.toString(),
      url: makeUnconfirmedHook(address.toString())
    })
  }).then(res => {
    return blockcypher.createHook({
      event: 'confirmed-tx',
      address: address.toString(),
      confirmations: EXPECTED_CONFIRMATIONS,
      url: makeConfirmedHook(address.toString())
    })
  }).then((res) => {
    return db.put('map-' + hash, address)
  }).then(result => {
    return res.json({
      success: 'true',
      digest: storeObject.digest,
      pay_address: storeObject.payment_address,
      price: config.get('documentPrice')
    })
  }).then(() => {
    let unconfirmed = _.omit(storeObject, 'path')
    return store.addLatestUnconfirmed(unconfirmed)
  }).catch(error => {
    console.log(error, error.stack)

    res.status(500).end('Unexpected remote error: ' + JSON.stringify(error))
  })
}
app.post('/api/v1/register/', (req, res) => {
  req.params.hash = req.body.d
  doRegister(req, res)
})

app.post('/api/v1/register/:hash', doRegister)

app.post('/confirmed/' + config.get('app.magicNumber') + '/:address', function (req, res) {
  var requestAddress = req.params.address
  var result

  res.end('')

  if (!core.transaction.isAddressAnInput(requestAddress, req.body)) {
    console.log('Not an input of tx', req.body.hash)
    return
  }

  db.put(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({

    address: requestAddress,
    activity: true,
    body: req.body

  })).then(dbResult => {
    return db.get(requestAddress)
  }).then(requestResult => {
    result = JSON.parse(requestResult)
    result.tx = req.body.hash
    result.blockstamp = req.body.confirmed

    return db.put(requestAddress, JSON.stringify(result))
  }).then(() => {
    let confirmed = _.omit(result, 'path')
    return store.addLatestConfirmed(confirmed)
  }).then(() => {
    core.mail.sendAdminDocproof(result.digest, result.tx, result.path, config.get('networkName'))
  })
})

app.get('/alldb/' + config.get('app.magicNumber'), (req, res) => {
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

app.post('/sweep/' + config.get('app.magicNumber'), function (req, res) {
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

app.post('/unconfirmed/' + config.get('app.magicNumber') + '/:address', function (req, res) {
  var requestAddress = req.params.address
  var addressScript = bitcore.Script.fromAddress(requestAddress)
  var result
  var outputs = []

  // ACK Blockcypher
  res.end('')

  console.log('unconfirmed callback', requestAddress)

  if (!core.transaction.isAddressAnOutput(requestAddress, req.body)) {
    console.log('Not an output of tx', req.body.hash)
    return
  }

  db.put(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({

    address: requestAddress,
    activity: true,
    body: req.body

  }))
  .then(dbResult => {
    return db.get(requestAddress)
  })
  .then(dbResult => {
    result = JSON.parse(dbResult)
  })
  .then(() => {
    return db.put('pending-sweep-' + requestAddress, result.path)
  })
  .then(() => {
    return blockcypher.getAddrFull(requestAddress, {limit: 50, txlimit: 2000})
  })
  .then(requestResult => {
    var satoshis = 0

    var hasAddress = output => output.addresses.reduce(
      (prev, address) => prev || (address === requestAddress), false
    )

    if (!requestResult.txs || !requestResult.txs.length) {
      db.put(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({
        address: requestAddress,
        error: 'No result in request for txs for address',
        body: requestResult
      }))
      return Promise.reject(new Error(`No txs in address ${requestAddress}`))
    }

    requestResult.txs.map(tx => {
      tx.outputs.map((output, index) => {
        if (hasAddress(output)) {
          satoshis += output.value
          outputs.push({
            txId: tx.hash,
            outputIndex: index,
            satoshis: output.value,
            script: addressScript
          })
        }
      })
    })

    if (satoshis < config.get('documentPrice')) {
      db.put(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({
        address: requestAddress,
        error: 'Insufficient funds',
        body: requestResult
      }))
      return Promise.reject(new Error(`Insufficient funds for ${requestAddress}`))
    }

    return blockcypher.getChain()
  }).then((chainResult) => {
    let feePerKb = chainResult.medium_fee_per_kb
    let changeAddress = outgoingHDPublicKey.derive(result.path).publicKey.toAddress()
    let signKey = incomingHDPrivateKey.derive(result.path).privateKey
    let tx = docproof.createTransaction(result.digest, outputs, signKey, changeAddress, feePerKb, config.get('feeMultiplier'))

    var serial = tx.serialize()

    return blockcypher.pushTX(serial)
  }).then((requestResult) => {
    result.tx = requestResult.tx.hash
    result.pending = false
    result.txstamp = new Date()

    return db.put(requestAddress, JSON.stringify(result))
  }).catch(error => {
    console.log(error.message)
  })
})

var doGet = function (req, res) {
  var hash = req.params.hash || req.query.d
  db.get('map-' + hash)
    .then(address => getController(address, hash, req, res))
    .catch(error => {
      if (error instanceof level.errors.NotFoundError) {
        res.json({
          'success': false,
          'reason': 'nonexistent'
        })
      } else {
        console.log(error, error.stack)
        res.status(500).end('Unexpected remote error: ' + JSON.stringify(error))
      }
    })
}

var doGetFromBody = (req, res) => {
  req.params.hash = req.body.hash || req.body.d
  doGet(req, res)
}

app.get('/api/v1/status', doGet)
app.get('/api/v1/status/:hash', doGet)
app.post('/api/v1/status/', doGetFromBody)
app.get('/api/v1/get/:hash', doGet)
app.post('/api/v1/get', doGetFromBody)

var getController = (address, hash, req, res) => {
  var result

  db.get(address).then(dbResult => {
    result = JSON.parse(dbResult)

    delete result.path
    result.network = bitcore.Networks.defaultNetwork.name
    result.success = true
    result.timestamp = core.util.formatDate(result.timestamp)
    result.txstamp = core.util.formatDate(result.txstamp)
    result.blockstamp = core.util.formatDate(result.blockstamp)

    result.price = config.get('documentPrice')

    delete result.fee
    delete result.feePerKilobyte

    return res.json(result)
  }).catch(error => {
    console.log(error, error.stack)
    res.status(500).end('Unexpected remote error: ' + JSON.stringify(error))
  })
}

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
