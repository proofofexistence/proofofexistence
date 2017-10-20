import bluebird from 'bluebird'
import bodyParser from 'body-parser'
import express from 'express'
import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'

import hbs from 'hbs'

import bitcore from 'bitcore'
import popsicle from 'popsicle'
var _ = bitcore.deps._
var Unit = bitcore.Unit;

import leveldb from 'levelup'
import moment from 'moment'
import {
  BLOCKCYPHER_TOKEN,
  MAGIC_NUMBER,
  BASE_PRIVATE_KEY,
  TARGET_PAYMENT_ADDRESS,
  DOCUMENT_PRICE,
  SIGN_PRICE,
  HOST_URL,
  PORT,
  DB_PATH,
  MAIL_FROM,
  MAIL_TO,
  MAIL_USER,
  MAIL_PASS,
  GOOGLE_TRACKING_ID,
  ENABLE_GOOGLE_ANALYTICS,
  networkName,
  DEBUG,
  FEE_MULTIPLIER
} from './config'


var BLOCKCYPHER_BASEURL = 'https://api.blockcypher.com/v1/btc/' + networkName;
var EXPECTED_CONFIRMATIONS = 1

var mail = new nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS
  }
})

var DOCUMENT_PRICE_MBTC = Unit.fromSatoshis(DOCUMENT_PRICE).toMilis()
var DOCUMENT_PRICE_BTC = Unit.fromSatoshis(DOCUMENT_PRICE).toBTC()
var SIGN_PRICE_MBTC = Unit.fromSatoshis(SIGN_PRICE).toMilis()

var app = express()
var db = bluebird.promisifyAll(new leveldb(DB_PATH))

var formatDate = (date) => date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : ''
var isAddressAnCPoint = inOrOut => {
  return (address, transaction) => {
    return transaction[inOrOut + 's'] && transaction[inOrOut + 's'].reduce(
      (prev, point) => prev || point.addresses && point.addresses.reduce(
        (prev, addr) => prev || (addr === address), false
      ), false
    )
  }
}

var isAddressAnInput = isAddressAnCPoint('input')
var isAddressAnOutput = isAddressAnCPoint('output')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
hbs.registerPartials(path.join(__dirname, 'views/partials'))

// expose to views whether it's a production environment
hbs.localsAsTemplateData(app);
app.locals.isProduction = app.settings.env === 'production';
app.locals.googleTrackingId = GOOGLE_TRACKING_ID
app.locals.enableGoogleAnalytics = ENABLE_GOOGLE_ANALYTICS

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
  res.render('developers', { title: 'API', active: { developers: true },
                             hostUrl: HOST_URL, documentPrice: DOCUMENT_PRICE
  })
})
app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact', active: { contact: true } })
})
app.get('/detail/:hash', (req, res) => {
  res.render('detail', { title: 'Document Information', active: { prove: true },
                         documentPriceMbtc: DOCUMENT_PRICE_MBTC
  })
})
app.get('/news', (req, res) => {
  res.render('news', { title: 'News', active: { news: true } })
})
app.get('/sign', (req, res) => {
  res.render('sign', { title: 'Sign', active: { prove: true } })
})
app.get('/sign/:hash', (req, res) => {
  res.render('beta', { title: 'Document Information', active: { prove: true },
                       signPriceMbtc: SIGN_PRICE_MBTC
  })
})

var BLOCKCYPHER_URL_TOKEN = '?token=' + BLOCKCYPHER_TOKEN
var BLOCKCYPHER_BROADCAST = BLOCKCYPHER_BASEURL + '/txs/push' + BLOCKCYPHER_URL_TOKEN
var BLOCKCYPHER_HOOK_ADDRESS = BLOCKCYPHER_BASEURL + '/hooks' + BLOCKCYPHER_URL_TOKEN

var makeUnconfirmedHook = address => HOST_URL + '/unconfirmed/' + MAGIC_NUMBER + '/' + address
var makeConfirmedHook = address => HOST_URL + '/confirmed/' + MAGIC_NUMBER + '/' + address

// TESTING
if (DEBUG) {
  makeUnconfirmedHook = makeConfirmedHook = address => 'http://requestb.in/1dx8r4v1'
}

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

db.getAsync('latest-confirmed').catch(() => {
  db.putAsync('latest-confirmed', '[]')
})

db.getAsync('latest-unconfirmed').catch(() => {
  db.putAsync('latest-unconfirmed', '[]')
})

var formatDates = doc => {
  doc.timestamp = formatDate(new Date(doc.timestamp))
  return doc;
}

app.get('/api/internal/latest/confirmed', (req, res) => {
  db.getAsync('latest-confirmed').then(results => res.send(JSON.stringify(_.map(JSON.parse(results), formatDates))))
})

app.get('/api/internal/latest/unconfirmed', (req, res) => {
  db.getAsync('latest-unconfirmed').then(results => res.send(JSON.stringify(_.map(JSON.parse(results), formatDates))))
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
  var address = BASE_PRIVATE_KEY.derive(randomPath).privateKey.toAddress()

  var storeObject = {
    digest: hash,
    path: randomPath,
    payment_address: address.toString(),
    pending: true,
    timestamp: new Date()
  }

  new Promise((resolve, reject) => {
    db.getAsync('map-' + hash)
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
      expectedSize * storeObject.feePerKilobyte * FEE_MULTIPLIER /
      1024);

    if (storeObject.fee > DOCUMENT_PRICE) {
      console.log("We should increase the price!", DOCUMENT_PRICE, "vs", storeObject.fee);
      storeObject.fee = DOCUMENT_PRICE - 1;
    }

    return db.putAsync(address.toString(), JSON.stringify(storeObject))

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

    return db.putAsync('map-' + hash, address)

  }).then(result => {

    return res.json({
      success: 'true',
      digest: storeObject.digest,
      pay_address: storeObject.payment_address,
      price: DOCUMENT_PRICE
    })

  }).then(() => {

    return db.getAsync('latest-unconfirmed')

  }).then(latest => {

    delete storeObject.path
    latest = JSON.parse(latest)
    latest = [storeObject].concat(latest)
    if (latest.length > 5) {
      latest.splice(5)
    }

    return db.putAsync('latest-unconfirmed', JSON.stringify(latest))

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

app.post('/api/v2/appendSig/', (req, res) => {
  const hash = req.body.hash
  var sigs

  const append = () => {
    return db.putAsync('sig-' + hash, JSON.stringify(sigs))
      .then(() => res.json({success: true}))
      .catch(() => {
        return res.status(500).json({success: false})
      })
  }

  db.getAsync('map-' + hash).then(address => {
    return db.getAsync(address)
  }).then(dbResult => {

    const result = JSON.parse(dbResult)
    if (!result.pending) {
      return res.json({success: false, reason: 'already confirmed'})
    } else {
      db.getAsync('sig-' + hash).then(retrievedSigs => {
        sigs = JSON.parse(retrievedSigs)
        const exists = sigs.reduce(
          ((prev, next) => prev || (next.fingerprint === req.body.signature.fingerprint)), false
        )
        if (!exists) {
          sigs.push(req.body.signature)
        }
        append()
      }).catch(e => {
        sigs = [req.body.signature]
        append()
      })
    }
  })
})

app.get('/api/v2/getSigs/:hash', (req, res) => {
  db.getAsync('sig-' + req.params.hash).then(sigs => {
    return res.json({success: true, signatures: JSON.parse(sigs)})
  }).catch(e => {
    console.log(e, e.stack)
    return res.json({success: false})
  })
})

app.post('/api/v1/register/:hash', doRegister)

app.post('/confirmed/' + MAGIC_NUMBER + '/:address', function(req, res) {

  var requestAddress = req.params.address
  var addressScript = bitcore.Script.fromAddress(requestAddress)
  var result

  res.end('')

  if (!isAddressAnInput(requestAddress, req.body)) {
    return
  }

  db.putAsync(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({

    address: requestAddress,
    activity: true,
    body: req.body

  })).then(dbResult => {

    return db.getAsync(requestAddress)

  }).then(requestResult => {

    result = JSON.parse(requestResult)
    result.tx = req.body.hash
    result.blockstamp = req.body.confirmed

    return db.putAsync(requestAddress, JSON.stringify(result))

  }).then(() => {

    return db.getAsync('latest-confirmed')

  }).then(latest => {

    latest = JSON.parse(latest)
    latest = [result].concat(latest)
    if (latest.length > 5) {
      latest.splice(5)
    }

    return db.putAsync('latest-confirmed', JSON.stringify(latest))
  }).then(() => {

    var mailOptions = {
      from: MAIL_FROM,
      to: MAIL_TO,
      subject: `[Proof of Existence] Document ${result.digest} verified`,
      text: `Document with hash ${result.digest} was verified in transaction ${result.tx}`,
      html: `Document with hash ${result.digest} was verified in transaction ` + `<a href="https://www.blocktrail.com/BTC/tx/${result.tx}">${result.tx}</a> <br/>` + `Path for private key derivation is ${result.path}`
    }
    mail.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error)
      }
    })
  })
})

app.get('/alldb/' + MAGIC_NUMBER, (req, res) => {
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

app.post('/sweep/' + MAGIC_NUMBER, function(req, res) {

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

app.post('/unconfirmed/' + MAGIC_NUMBER + '/:address', function(req, res) {

  var requestAddress = req.params.address
  var addressScript = bitcore.Script.fromAddress(requestAddress)
  var result

  // ACK Blockcypher
  res.end('')

  console.log('unconfirmed callback', requestAddress)

  if (!isAddressAnOutput(requestAddress, req.body)) {
    console.log('Not an output', req.body)
    return
  }

  db.putAsync(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({

    address: requestAddress,
    activity: true,
    body: req.body

  }))
  .then(dbResult => {

    return db.getAsync(requestAddress)

  })
  .then(dbResult => {

    result = JSON.parse(dbResult)
    return new Promise((resolve, reject) => {
      try {
      db.getAsync('sig-' + result.digest).then(signatures => {
        result.sighash = bitcore.crypto.Hash.sha256(new Buffer(signatures)).toString('hex')
        resolve()
      }).catch(() => {
        resolve()
      })
      } catch (e) {
        console.log(e, e.stack)
      }
    })
  })
  .then(() => {

    return db.putAsync('pending-sweep-' + requestAddress, result.path)

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
      db.putAsync(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({
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

    if ((!result.sighash && satoshis < DOCUMENT_PRICE) || (result.sighash && satoshis < SIGN_PRICE)) {
      db.putAsync(requestAddress + '-log-' + new Date().getTime(), JSON.stringify({
        address: requestAddress,
        error: 'Insufficient funds',
        body: requestResult.body
      }))
      return
    }

    var tx = new bitcore.Transaction()

    outputs.map(output => tx.from(output))

    if (result.sighash) {
      tx.addData(bitcore.util.buffer.concat([new Buffer('DOCPROOF'), new Buffer(result.sighash, 'hex')]))
    } else {
      tx.addData(bitcore.util.buffer.concat([new Buffer('DOCPROOF'), new Buffer(result.digest, 'hex')]))
    }
    tx.change(TARGET_PAYMENT_ADDRESS.derive(result.path).publicKey.toAddress())
    if (result.fee) {
      tx.fee(result.fee);
    }
    tx.sign(BASE_PRIVATE_KEY.derive(result.path).privateKey)

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

  }).then((requestResult, err) => {

    console.log(err)

    result.tx = requestResult.body.tx.hash
    result.pending = false
    result.txstamp = new Date();

    return db.putAsync(requestAddress, JSON.stringify(result))

  }).catch(error => {

    console.log(error, error.stack)

  })
})


var doGet = function(req, res) {
  var hash = req.params.hash || req.query.d
  db.getAsync('map-' + hash)
    .then(address => getController(address, hash, req, res))
    .catch(error => {
      if (error instanceof leveldb.errors.NotFoundError) {
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

  db.getAsync(address).then(dbResult => {

    result = JSON.parse(dbResult)

    delete result.path
    result.network = bitcore.Networks.defaultNetwork.name
    result.success = true
    result.timestamp = formatDate(result.timestamp)
    result.txstamp = formatDate(result.txstamp)
    result.blockstamp = formatDate(result.blockstamp)

    result.payment_amount = DOCUMENT_PRICE_BTC

    delete result.fee
    delete result.feePerKilobyte

    db.getAsync('sig-' + hash).then(signatures => {
      result.rawSignatures = signatures
      result.signatures = JSON.parse(signatures)
      result.sighash = bitcore.crypto.Hash.sha256(new Buffer(signatures)).toString('hex')
      return res.json(result)
    }).catch(e => {
      return res.json(result)
    })

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

var server = app.listen(PORT, function() {
  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)
})
