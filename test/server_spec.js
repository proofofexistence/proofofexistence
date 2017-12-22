process.env.NODE_ENV = 'test'

var chai = require('chai')
var chaiHttp = require('chai-http')
var expect = chai.expect

chai.use(chaiHttp)

const server = require('../lib/server')
const request = chai.request(server)

after(() => {
  server.stop()
})
