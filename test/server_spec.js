process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var expect = chai.expect

chai.use(chaiHttp)

var bitcore = require('bitcore')
var Unit = bitcore.Unit

const config = require('../lib/config')
const server = require('../lib/server')
const request = chai.request(server)

describe('register a document', () => {
  var digest = '15db6dbff590000ea13246e1c166802b690663c4e0635bfca78049d5a8762832'
  var register

  expected_price_satoshi = config.DOCUMENT_PRICE
  expected_price_btc = Unit.fromSatoshis(config.DOCUMENT_PRICE).toBTC()
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

        register = JSON.parse(res.text)
        expect(register.success).to.equal('true')
        expect(register.digest).to.equal(digest)
        expect(register.price).to.equal(expected_price_satoshi)
        expect(register.pay_address).to.be.a('string')
        expect(register.pay_address).to.have.lengthOf(34)
        done()
      })
  })

  it('it should have a status', (done) => {
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
        expect(status.payment_address).to.equal(register.pay_address)
        expect(status.payment_amount).to.equal(expected_price_btc)
        expect(status.price).to.equal(expected_price_satoshi)
        expect(status.network).to.equal(expected_network)
        expect(status.timestamp).to.be.a('string')
        expect(status.txstamp).to.be.a('string')
        expect(status.blockstamp).to.be.a('string')
        done()
      })
  })
})

describe('/GET latest unconfirmed', () => {
  it('it should GET the latest unconfirmed', (done) => {
    request
      .get('/api/internal/latest/unconfirmed')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        done()
      })
  })
})

describe('/GET latest confirmed', () => {
  it('it should GET the latest confirmed', (done) => {
    request
      .get('/api/internal/latest/confirmed')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        done()
      })
  })
})

after(() => {
  server.destroy()
})
