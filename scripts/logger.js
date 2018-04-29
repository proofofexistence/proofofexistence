const bunyan = require('bunyan')

const logger = bunyan.createLogger({name: "proofx"})

module.exports = logger
