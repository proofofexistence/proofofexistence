process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var expect = chai.expect

chai.use(chaiHttp)

const server = require('../lib/server')
const request = chai.request(server)

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
