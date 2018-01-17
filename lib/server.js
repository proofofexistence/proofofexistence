'use strict'

var bodyParser = require('body-parser')
var express = require('express')
var path = require('path')
var nodemailer = require('nodemailer')

var hbs = require('hbs')

var bitcore = require('bitcore')
var popsicle = require('popsicle')
var _ = require('lodash')
var Unit = bitcore.Unit

var level = require('level')
var moment = require('moment')

var config = require('config')
var db = require('./db')

var BLOCKCYPHER_BASEURL = 'https://api.blockcypher.com/v1/btc/' + config.get('networkName')
var EXPECTED_CONFIRMATIONS = 1

var MailTransport = nodemailer.createTransport
var mail = new MailTransport(config.get('nodemailer.options'))

// TODO: Remove after upgrading to bitcore-lib 0.15.0
bitcore.Transaction.FEE_SECURITY_MARGIN = 150
bitcore.Transaction.FEE_PER_KB = 100000

var DOCUMENT_PRICE_MBTC = Unit.fromSatoshis(config.get('DOCUMENT_PRICE')).toMilis()

var app = express()

var formatDate = (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : ''
var isAddressAnCPoint = inOrOut => {
  return (address, transaction) => {
    return transaction[inOrOut + 's'] && transaction[inOrOut + 's'].reduce(
      (prev, point) => prev || (point.addresses && point.addresses.reduce(
        (prev, addr) => prev || (addr === address), false
      )), false
    )
  }
}

var isAddressAnInput = isAddressAnCPoint('input')
var isAddressAnOutput = isAddressAnCPoint('output')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    hostUrl: config.get('HOST_URL'),
    documentPrice: config.get('DOCUMENT_PRICE')
  })
})
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', active: { contact: true } })
})
app.get('/detail/:hash', (req, res) => {
  res.render('detail', { title: 'Document Information',
    active: { prove: true },
    documentPriceMbtc: DOCUMENT_PRICE_MBTC
  })
})
app.get('/news', (req, res) => {
  res.render('news', { title: 'News', active: { news: true } })
})

var BLOCKCYPHER_URL_TOKEN = '?token=' + config.get('BLOCKCYPHER_TOKEN')
var BLOCKCYPHER_BROADCAST = BLOCKCYPHER_BASEURL + '/txs/push' + BLOCKCYPHER_URL_TOKEN
var BLOCKCYPHER_HOOK_ADDRESS = BLOCKCYPHER_BASEURL + '/hooks' + BLOCKCYPHER_URL_TOKEN

var makeUnconfirmedHook = address => config.get('HOST_URL') + '/unconfirmed/' + config.get('MAGIC_NUMBER') + '/' + address
var makeConfirmedHook = address => config.get('HOST_URL') + '/confirmed/' + config.get('MAGIC_NUMBER') + '/' + address

var makeFullAddressUrl = address => BLOCKCYPHER_BASEURL + '/addrs/' + address + '/full' + BLOCKCYPHER_URL_TOKEN + '&limit=50&txlimit=2000'

var makeInt = (array, offset) => {
  var result = 0

  // Hack, make sure not to use hardened keys
  // This just reduces amount of entropy for derivations by N bits if using N integers
  array[offset + 3] = array[offset + 3] >> 1
  for (let i = 0, pow = 1; i < 4; result += array[i + offset] * pow, i++, pow *= 256) {}
  return result
}

var getRandomPath = () => {
  var random = bitcore.crypto.Random.getRandomBuffer(12)
  return 'm/' + makeInt(random, 0) + '/' + makeInt(random, 4) + '/' + makeInt(random, 8)
}

db.get('latest-confirmed').catch(() => {
  db.put('latest-confirmed', '[]')
})

db.get('latest-unconfirmed').catch(() => {
  db.put('latest-unconfirmed', '[]')
})

var formatDates = doc => {
  doc.timestamp = formatDate(new Date(doc.timestamp))
  return doc
}

app.get('/api/internal/latest/confirmed', (req, res) => {
  db.get('latest-confirmed').then(results => res.json(_.map(JSON.parse(results), formatDates)))
})

app.get('/api/internal/latest/unconfirmed', (req, res) => {
  db.get('latest-unconfirmed').then(results => res.json(_.map(JSON.parse(results), formatDates)))
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
  var randomPath = getRandomPath()
  var address = config.get('BASE_PRIVATE_KEY').derive(randomPath).privateKey.toAddress()

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
        resolve(popsicle({
          method: 'GET',
          url: BLOCKCYPHER_BASEURL + BLOCKCYPHER_URL_TOKEN
        }))
      })
  }).then(result => {
    storeObject.feePerKilobyte = result.body.medium_fee_per_kb
    var expectedSize = 148 +// one input size
      34 + // pubkey output size
      42 + // op_return size
      10// version, nlocktime, input size, output size
    storeObject.fee = Math.ceil(
      expectedSize * storeObject.feePerKilobyte * config.get('FEE_MULTIPLIER') /
      1024)

    if (storeObject.fee > config.get('DOCUMENT_PRICE')) {
      console.log('We should increase the price!', config.get('DOCUMENT_PRICE'), 'vs', storeObject.fee)
      storeObject.fee = config.get('DOCUMENT_PRICE') - 1
    }

    return db.put(address.toString(), JSON.stringify(storeObject))
  }).then(result => {
    return popsicle({
      method: 'POST',
      url: BLOCKCYPHER_HOOK_ADDRESS,
      body: {
        event: 'unconfirmed-tx',
        address: address.toString(),
        url: makeUnconfirmedHook(address.toString())
      }
    })
  }).then(res => {
    return popsicle({
      method: 'POST',
      url: BLOCKCYPHER_HOOK_ADDRESS,
      body: {
        event: 'confirmed-tx',
        address: address.toString(),
        confirmations: EXPECTED_CONFIRMATIONS,
        url: makeConfirmedHook(address.toString())
      }
    })
  }).then((res) => {
    return db.put('map-' + hash, address)
  }).then(result => {
    return res.json({
      success: 'true',
      digest: storeObject.digest,
      pay_address: storeObject.payment_address,
      price: config.get('DOCUMENT_PRICE')
    })
  }).then(() => {
    return db.get('latest-unconfirmed')
  }).then(latest => {
    delete storeObject.path
    latest = JSON.parse(latest)
    latest = [storeObject].concat(latest)
    if (latest.length > 5) {
      latest.splice(5)
    }

    return db.put('latest-unconfirmed', JSON.stringify(latest))
  }).catch(error => {
    console.log(error, error.stack)

    res.status(500).end('Unexpected remote error: ' + JSON.stringify(error))
  })
}
app.get('/api/v1/register/', (req, res) => {
  req.params.hash = req.query.d
  doRegister(req, res)
})
app.post('/api/v1/register/', (req, res) => {
  req.params.hash = req.body.d
  doRegister(req, res)
})

app.post('/api/v1/register/:hash', doRegister)

app.post('/confirmed/' + config.get('MAGIC_NUMBER') + '/:address', function (req, res) {
  var requestAddress = req.params.address
  var result

  res.end('')

  if (!isAddressAnInput(requestAddress, req.body)) {
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
    return db.get('latest-confirmed')
  }).then(latest => {
    latest = JSON.parse(latest)
    let confirmed = _.omit(result, 'path')
    latest = [confirmed].concat(latest)
    if (latest.length > 5) {
      latest.splice(5)
    }

    return db.put('latest-confirmed', JSON.stringify(latest))
  }).then(() => {
    var txNet = (config.get('networkName') === 'test3' ? 'btc-testnet' : 'btc')
    var txUrl = `https://live.blockcypher.com/${txNet}/tx/${result.tx}`

    var mailOptions = {
      from: config.get('MAIL_FROM'),
      to: config.get('MAIL_TO'),
      subject: `[Proof of Existence] Document ${result.digest} verified (${config.get('HOST')})`,
      text: `Document with hash ${result.digest} was verified in transaction ${result.tx}`,
      html: `Document with hash ${result.digest} was verified in transaction ` + `<a href="${txUrl}">${result.tx}</a> <br/>` + `Path for private key derivation is ${result.path} <br/> (${config.get('HOST')})`
    }
    mail.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      }
    })
  })
})

app.get('/alldb/' + config.get('MAGIC_NUMBER'), (req, res) => {
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

app.post('/sweep/' + config.get('MAGIC_NUMBER'), function (req, res) {
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

app.post('/unconfirmed/' + config.get('MAGIC_NUMBER') + '/:address', function (req, res) {
  var requestAddress = req.params.address
  var addressScript = bitcore.Script.fromAddress(requestAddress)
  var result

  // ACK Blockcypher
  res.end('')

  console.log('unconfirmed callback', requestAddress)

  if (!isAddressAnOutput(requestAddress, req.body)) {
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
    return popsicle({
      method: 'GET',
      url: makeFullAddressUrl(requestAddress)
    })
  })
  .then(requestResult => {
    var outputs = []
    var satoshis = 0

    var hasAddress = output => output.addresses.reduce(
      (prev, address) => prev || (address === requestAddress), false
    )

    if (!requestResult.body.txs || !requestResult.body.txs.length) {
      db.put(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({
        address: requestAddress,
        error: 'No result in request for txs for address',
        body: requestResult.body
      }))
      return
    }

    requestResult.body.txs.map(tx => {
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

    if (satoshis < config.get('DOCUMENT_PRICE')) {
      db.put(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({
        address: requestAddress,
        error: 'Insufficient funds',
        body: requestResult.body
      }))
      return
    }

    var tx = new bitcore.Transaction()

    outputs.map(output => tx.from(output))

    tx.addData(bitcore.util.buffer.concat([Buffer.from('DOCPROOF'), Buffer.from(result.digest, 'hex')]))
    tx.change(config.get('TARGET_PAYMENT_ADDRESS').derive(result.path).publicKey.toAddress())
    if (result.fee) {
      tx.fee(result.fee)
    }
    tx.sign(config.get('BASE_PRIVATE_KEY').derive(result.path).privateKey)

    var serial
    try {
      serial = tx.serialize()
    } catch (error) {
      console.log(error, error.stack)
      return
    }

    return popsicle({
      method: 'POST',
      url: BLOCKCYPHER_BROADCAST,
      body: {
        tx: serial
      }
    })
  }).then((requestResult) => {
    result.tx = requestResult.body.tx.hash
    result.pending = false
    result.txstamp = new Date()

    return db.put(requestAddress, JSON.stringify(result))
  }).catch(error => {
    console.log(error, error.stack)
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
    result.timestamp = formatDate(result.timestamp)
    result.txstamp = formatDate(result.txstamp)
    result.blockstamp = formatDate(result.blockstamp)

    result.price = config.get('DOCUMENT_PRICE')

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

var server = app.listen(config.get('PORT'), function () {
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
