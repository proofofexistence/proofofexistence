var digest = '8d1321a1d31f5603be10bab6a11b58009c03658e1a29248656db7a7e4f86d814'
var address = 'ms6zWKUFA1txnncwcFvxc99899wjXrbGRH'
var timestamp = '2018-01-18T06:28:24.134Z'

module.exports = {
  address: address,
  digest: digest,
  document: {
    digest: digest,
    path: 'm/0/0/0',
    payment_address: address,
    pending: true,
    timestamp: timestamp,
    fee: 120128
  },
  unconfirmed: {
    digest: digest,
    payment_address: address,
    pending: true,
    timestamp: timestamp,
    feePerKilobyte: 124099,
    fee: 120128
  },
  confirmed: {
    digest: '29872ac22b737be58a0fcf82921c9d8b0cb7aa8f6d8e68b08663014d7d8a0449',
    payment_address: address,
    pending: false,
    timestamp: timestamp,
    feePerKilobyte: 124099,
    fee: 120128,
    tx: 'b4d42409fefd3286e4f4f13e8e65caa525eaa3251ddafa0b9902ef7a26239816',
    txstamp: '2018-01-18T06:29:13.525Z',
    blockstamp: '2018-01-18T06:48:39Z'
  }
}
