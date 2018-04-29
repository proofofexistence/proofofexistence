#!/usr/bin/env node --harmony
var fs = require('fs')
var minimist = require('minimist')
var crypto = require('crypto')

var APIClient = require('../client')
const logger = require('../scripts/logger')

var argv = minimist(process.argv, {
  alias: {
    v: 'version',
    h: 'host',
    p: 'port',
    n: 'network',
    vv: 'verbose',
    u: 'update'
  },
  default: {
    p: '3003',
    h: 'http://localhost',
    n: 'testnet'
  },
  boolean: ['version', 'help', 'verbose']
})

var filename = argv._[2]

var url = argv.host + (argv.port ? ":"+argv.port : null )

if (argv.verbose) {
    logger.level('debug')
}

if (argv.version) {
  console.log(require('../package').version)
  process.exit(0)
}

if (argv.help || (process.stdin.isTTY && !filename)) {
  console.error(
    'Usage: proofx [filename] [options]\n\n' +
    '  --update,-u         Fetch latest status from the blockchain\n' +
    '  --host,-h           URL of the proofx instance\n' +
    '  --port,-p           Port where proofx is running\n' +
    '  --verbose,-vv       Print out more logs\n' +
    '  --version,-v        Print out the installed version\n' +
    '  --help              Show this help\n'
  )
  process.exit(1)
}

// get data from file or pipe
var input
var algo = 'sha256';
var shasum = crypto.createHash(algo);

if (filename === '-' || !filename) {
  input = process.stdin
} else if (fs.existsSync(filename)) {
  input = fs.createReadStream(filename)
} else {
  console.error('File: %s does not exist', filename)
  process.exit(2)
}

var data = ''
input.on('data', function(chunk) {
  data += chunk;
  shasum.update(chunk)
})
input.on('end', function() {
  var d = shasum.digest('hex');
  console.log("sha256 : "+d)
  register(d)
})

function isValidSHA256(sha256) {
  var re = /\b[A-Fa-f0-9]{64}\b/
  return re.test(sha256)
}

// connect to API
var api = new APIClient({baseUrl:url});

function register(sha256) {
  if (!isValidSHA256(sha256)) {
    console.log('Please pass a valid hash.')
    process.exit(0)
  }

  api.register(sha256,
    resp => {
      const {success, reason} = resp

      if (success) { // new record
        const {
          pay_address,
          price
        } = resp

        console.log(
          `Payment awaiting... ${price} mBTC to ${pay_address}`
        )
      } else if (success === false && reason === 'existing') { // record already exist in local DB

        if (argv.update) {
          api.updateStatus(sha256,
            resp => showStatus(resp)
          )
        } else {
          api.getStatus(sha256,
            resp => showStatus(resp)
          )
        }

      }
    },
    err => console.log(err)
  )
}

function showStatus(resp) {
  const {
    payment_address,
    price,
    pending,
    tx,
    txstamp,
    blockstamp,
    status
  } = resp

  switch (status) {
    case "paymentRequired":
      console.log(
         `Payment awaiting... ${price} mBTC to ${payment_address}`
       )
      break;
    case "confirming":
      console.log(
         `A transaction has been succesfully recorded. Now waiting for the block to confirmed. You can check the transaction id at ${tx}.`
       )
      break;
    case "confirmed":
      console.log(
         `This document is already confirmed. The transaction id is ${tx} in the block ${blockstamp}.`
       )
      break;
    default:

  }
}
