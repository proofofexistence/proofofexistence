process.env.NODE_ENV = 'test'

const chai = require('chai')
const expect = chai.expect

const core = require('../lib/core')
const docproof = core.docproof
const transaction = core.transaction
const wallet = core.wallet

const Insights = require('./fixtures/insight')
const insights = new Insights()
const records = require('./fixtures/records')

describe('get docproof price', () => {
  it('it should get the docproof price unit', (done) => {
    docproofPrice = docproof.price().toSatoshis()
    expect(docproofPrice).to.equal(200000)
    done()
  })

  it('it should get an adjusted price based on the fee per KB', (done) => {
    feePerKb = 124099

    docproofPrice = docproof.adjustedPrice(feePerKb).toSatoshis()
    expect(docproofPrice).to.equal(50000)

    docproofPrice = docproof.adjustedPrice(feePerKb, 4).toSatoshis()
    expect(docproofPrice).to.equal(125000)

    done()
  })
})

describe('estimate docproof fees', () => {
  it('it should estimate a fee based on fee per kb', (done) => {
    feePerKb = 100000
    docproofFee = docproof.estimateFee(feePerKb)
    expect(docproofFee).to.equal(24200)
    done()
  })

  it('it should estimate a fee based on fee per kb, with a multiplier', (done) => {
    feePerKb = 124099
    docproofFee = docproof.estimateFee(feePerKb, 4)
    expect(docproofFee).to.equal(120128)
    done()
  })
})

describe('validate a document digest hash', () => {
  it('it should return true for valid digests', (done) => {
    expect(docproof.isValidDigest(records.digest)).to.be.true
    done()
  })

  it('it should return false for invalid digests', (done) => {
    expect(docproof.isValidDigest('test')).to.be.false
    expect(docproof.isValidDigest(null)).to.be.false
    expect(docproof.isValidDigest('')).to.be.false
    expect(docproof.isValidDigest()).to.be.false
    done()
  })
})

describe('generate a random non-hardened HD child key derivation path', () => {
  it('it should generate a path with three levels', (done) => {
    randomPath = wallet.getRandomPath()
    expect(randomPath).to.be.a('string')
    expect(randomPath).to.match(/^m\/\d+\/\d+\/\d+$/)
    done()
  })
})
