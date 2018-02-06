process.env.NODE_ENV = 'test'

const chai = require('chai')
const expect = chai.expect

const core = require('../lib/core')
const docproof = core.docproof

describe('estimate docproof fees', () => {
  it('it should estimate a fee based on fee per kb', (done) => {
    feePerKb = 100000
    docproofFee = docproof.estimateFee(feePerKb)
    expect(docproofFee).to.equal(23400)
    done()
  })

  it('it should estimate a fee based on fee per kb, with a multiplier', (done) => {
    feePerKb = 124099
    docproofFee = docproof.estimateFee(feePerKb, 4)
    expect(docproofFee).to.equal(116157)
    done()
  })
})
