process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var expect = chai.expect
var nock = require('nock')
var extend = require('util')._extend

chai.use(chaiHttp)

var bitcore = require('bitcore')
var Unit = bitcore.Unit

const config = require('config')
const db = require('../lib/db')
const server = require('../lib/server')
const request = chai.request(server)

const btc = require('./fixtures/btc')
const records = require('./fixtures/records')

const networkName = config.get('networkName')
const blockcypherToken = config.get('BLOCKCYPHER_TOKEN')
const magicNumber = config.get('MAGIC_NUMBER')

describe('register a document', () => {

  var address = records.address
  var digest = records.digest
  var document = records.document

  expected_price_satoshi = config.get('DOCUMENT_PRICE')
  expected_network = bitcore.Networks.defaultNetwork.name

  it('it should return payment details', (done) => {
    request
      .post('/api/v1/register')
      .type('form')
      .send({d: digest})
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res).to.be.json

        var register = JSON.parse(res.text)
        expect(register.success).to.equal('true')
        expect(register.digest).to.equal(digest)
        expect(register.price).to.equal(expected_price_satoshi)
        expect(register.pay_address).to.be.a('string')
        expect(register.pay_address).to.have.lengthOf(34)
        done()
      })
  })

  it('it should have a status', (done) => {
    db.batch()
      .put(`map-${digest}`, address)
      .put(address, JSON.stringify(document))
      .write(() => {
        request
          .post('/api/v1/status')
          .type('form')
          .send({d: digest})
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res).to.be.json

            status = JSON.parse(res.text)
            expect(status.success).to.equal(true)
            expect(status.pending).to.equal(true)
            expect(status.digest).to.equal(digest)
            expect(status.payment_address).to.equal(address)
            expect(status.price).to.equal(expected_price_satoshi)
            expect(status.network).to.equal(expected_network)
            expect(status.timestamp).to.be.a('string')
            expect(status.txstamp).to.be.a('string')
            expect(status.blockstamp).to.be.a('string')
            done()
          })
      })
  })

  it('it should process an unconfirmed tx webhook', (done) => {
    db.batch()
      .put(`map-${digest}`, address)
      .put(address, JSON.stringify(document))
      .write(() => {
        request
          .post(`/unconfirmed/${magicNumber}/${address}`)
          .type('application/json')
          .send(btc.unconfirmedPaymentTx())
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            done()
          })
      })
  })

  it('it should process a confirmed tx webhook', (done) => {
    var doc = extend({}, document)
    doc.pending = false
    doc.txstamp = new Date()
    doc.tx = btc.txPush().tx.hash

    db.batch()
      .put(`map-${digest}`, address)
      .put(address, JSON.stringify(doc))
      .write(() => {
        request
          .post(`/confirmed/${magicNumber}/${address}`)
          .type('application/json')
          .send(btc.confirmedDocproofTx())
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            done()
          })
      })
  })
})

describe('/GET latest unconfirmed', () => {
  it('it should GET the latest unconfirmed', (done) => {
    db.batch()
      .put('latest-unconfirmed', JSON.stringify([records.unconfirmed]))
      .write(() => {
        request
          .get('/api/internal/latest/unconfirmed')
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res).to.be.json

            var unconfirmed = res.body[0]
            expect(unconfirmed.digest).to.equal(records.unconfirmed.digest)
            expect(unconfirmed.timestamp).to.match(/^[0-9-]+ [0-9:]+$/)
            done()
          })
      })
  })
})

describe('/GET latest confirmed', () => {
  it('it should GET the latest confirmed', (done) => {
    db.batch()
      .put('latest-confirmed', JSON.stringify([records.confirmed]))
      .write(() => {
        request
          .get('/api/internal/latest/confirmed')
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res).to.be.json

            var confirmed = res.body[0]
            expect(confirmed.digest).to.equal(records.confirmed.digest)
            expect(confirmed.timestamp).to.match(/^[0-9-]+ [0-9:]+$/)
            done()
          })
      })
  })
})

beforeEach(() => {
  db.del(`map-${records.digest}`)
  db.del(records.address)
})

before(() => {
  var explorer = nock('https://api.blockcypher.com', {allowUnmocked: false})

  explorer.get(`/v1/btc/${networkName}`)
    .query({token: blockcypherToken})
    .reply(200, btc.index, {'Content-Type': 'application/json'})

  explorer.post(`/v1/btc/${networkName}/hooks`, ((body) => {
    return body.event === 'unconfirmed-tx'
  }))
    .query({token: blockcypherToken})
    .reply(201, ((uri, body) => {
      return btc.unconfirmedTxHook(body, blockcypherToken)
    }), {
      'Content-Type': 'application/json'
    })

  explorer.post(`/v1/btc/${networkName}/hooks`, ((body) => {
    return body.event === 'confirmed-tx'
  }))
    .query({token: blockcypherToken})
    .reply(201, ((uri, body) => {
      return btc.confirmedTxHook(body, blockcypherToken)
    }), {
      'Content-Type': 'application/json'
    })

  addrsRegex = /\/v1\/btc\/[a-z0-9]+\/addrs\/([A-Za-z0-9]+)\/full/
  explorer.get(addrsRegex)
    .query({token: blockcypherToken, limit: 50, txlimit: 2000})
    .reply(200, ((uri) => {
      address = uri.match(addrsRegex)[1]
      return btc.addressFull(address)
    }), {
      'Content-Type': 'application/json'
    })

  explorer.post(`/v1/btc/${networkName}/txs/push`)
    .query({token: blockcypherToken})
    .reply(200, ((uri, body) => {
      return btc.txPush()
    }), {
      'Content-Type': 'application/json'
    })
})

after(() => {
  server.stop()
  db.destroy()
})
