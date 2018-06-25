process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var expect = chai.expect
var nock = require('nock')
var extend = require('util')._extend
var _ = require('lodash')

const { URL } = require('url')

chai.use(chaiHttp)

const chains = require('../lib/chains')
const bitcore = chains.get()
var Unit = bitcore.Unit

const config = require('config')
const db = require('../lib/db')
const server = require('../server/app')
const request = chai.request(server)

const Insights = require('./fixtures/insight')
const insights = new Insights()
const records = require('./fixtures/records')

const insightApiUrl = new URL(config.get('insightApiUrl'))
const magicNumber = config.get('app.magicNumber')

describe('register a document', () => {

  var address = records.address
  var digest = records.digest
  var document = records.document

  expected_price_satoshi = chains.documentPrice()
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

        var register = res.body
        expect(register.success).to.equal('true')
        expect(register.digest).to.equal(digest)
        expect(register.price).to.equal(expected_price_satoshi)
        expect(register.pay_address).to.be.a('string')
        expect(register.pay_address).to.have.lengthOf(34)
        done()
      })
  })

  it('it should return an error message if the document is already registered', (done) => {
    db.batch()
      .put(`map-${digest}`, address)
      .put(address, JSON.stringify(document))
      .write(() => {
        request
          .post('/api/v1/register')
          .type('form')
          .send({d: digest})
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res).to.be.json

            let register = res.body
            expect(register.success).to.be.false
            expect(register.reason).to.equal('existing')
            expect(register.digest).to.equal(digest)
            done()
          })
      })
  })

  it('it should return an error on invalid hash', (done) => {
    request
      .post('/api/v1/register')
      .type('form')
      .send({d: 'invalid'})
      .end((err, res) => {
        expect(err).to.not.be.null
        expect(res).to.have.status(400)
        expect(res).to.be.json
        expect(res.body).to.deep.equal({reason: 'Invalid `hash` field' })
        done()
      })
  })

  it('it should update a status', (done) => {
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

            status = res.body

            expect(status.success).to.equal(true)
            expect(status.pending).to.equal(false)
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

  it('it should get a status', (done) => {
    db.batch()
      .put(`map-${digest}`, address)
      .put(address, JSON.stringify(document))
      .write(() => {
        request
          .get(`/api/v1/status/${digest}`)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res).to.be.json

            status = res.body
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

  it('it should query a status', (done) => {
    db.batch()
      .put(`map-${digest}`, address)
      .put(address, JSON.stringify(document))
      .write(() => {
        request
          .get(`/api/v1/status?d=${digest}`)
          .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200)
            expect(res).to.be.json

            status = res.body
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

  it('it should handle a missing status', (done) => {
    request
      .get(`/api/v1/status/${digest}`)
      .end((err, res) => {
        expect(err).to.not.be.null
        expect(res).to.have.status(404)
        expect(res).to.be.json

        status = res.body
        expect(status.success).to.be.false
        expect(status.reason).to.equal('nonexistent')
        done()
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
  const insight = nock(insightApiUrl.origin, {allowUnmocked: false}).persist()
  const inpath = insightApiUrl.pathname === '/' ? '' : insightApiUrl.pathname

  insight.get(`${inpath}/txs`)
    .query({address: records.address})
    .reply(200, insights.addrFull(), {'Content-Type': 'application/json'})

  insight.get(`${inpath}/utils/estimatefee`)
    .query({nbBlocks: 2})
    .reply(200, insights.estimateFee, {'Content-Type': 'application/json'})

  insight.post(`${inpath}/tx/send`, ((body) => {
    const tx = new bitcore.Transaction(body.rawtx).toObject()

    const checkPayment = _.some(tx.inputs, {
      prevTxId: 'a1802a77ae533a862f7df5d7be2e7fb24fe65d6b6d1b05921a91bdfcdb0c2d1b'
    })

    const checkDocproof = _.some(tx.outputs, {
      script: `6a28444f4350524f4f46${records.digest}`
    })

    const checkFee = _.some(tx.outputs, {
      satoshis: 79872
    })

    return checkPayment && checkDocproof && checkFee
  }))
    .reply(200, ((uri, body) => {
      const tx = new bitcore.Transaction(body.tx)
      return insights.txSend(tx.hash)
    }), {
      'Content-Type': 'application/json'
    })
})

after(() => {
  server.stop()
  db.destroy()
  insights.reset()
})
