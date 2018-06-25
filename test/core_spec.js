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

describe('check if an address is a transaction input', () => {
  it('it should return true when an address is an input', (done) => {
    let tx = insights.txsAddress.txs[0]
    let address = 'ms6zWKUFA1txnncwcFvxc99899wjXrbGRH'
    let isAddressAnInput = transaction.isAddressAnInput(address, tx)
    expect(isAddressAnInput).to.be.true
    done()
  })

  it('it should return false when an address is an not input', (done) => {
    let tx = insights.txsAddress.txs[0]
    let address = 'moCXE9C7sB8zoEM673naWb1YSDwmdgNkw7'
    let isAddressAnInput = transaction.isAddressAnInput(address, tx)
    expect(isAddressAnInput).to.be.false
    done()
  })

  it('it should return false if any values are missing', (done) => {
    expect(transaction.isAddressAnInput('test', {})).to.be.false
    expect(transaction.isAddressAnInput('test', {vin: []})).to.be.false
    expect(transaction.isAddressAnInput('test', {vin: [{}]})).to.be.false
    done()
  })
})

describe('check if an address is a transaction output', () => {
  it('it should return true when an address is an output', (done) => {
    let tx = insights.txsAddress.txs[1]
    let address = 'ms6zWKUFA1txnncwcFvxc99899wjXrbGRH'
    let isAddressAnOutput = transaction.isAddressAnOutput(address, tx)
    expect(isAddressAnOutput).to.be.true
    done()
  })

  it('it should return false when an address is not an output', (done) => {
    let tx = insights.txsAddress.txs[1]
    let address = 'moCXE9C7sB8zoEM673naWb1YSDwmdgNkw7'
    let isAddressAnOutput = transaction.isAddressAnOutput(address, tx)
    expect(isAddressAnOutput).to.be.false
    done()
  })

  it('it should return false if any values are missing', (done) => {
    expect(transaction.isAddressAnOutput('test', {})).to.be.false
    expect(transaction.isAddressAnOutput('test', {vout: []})).to.be.false
    expect(transaction.isAddressAnOutput('test', {vout: [{}]})).to.be.false
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
