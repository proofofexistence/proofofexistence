'use strict'

var config = require('config')
const nodemailer = require('nodemailer')

const MailTransport = nodemailer.createTransport
const mail = new MailTransport(config.get('nodemailer.options'))

/**
 * Generate a tranaction URL on a block explorer
 */

function transactionUrl (networkName, txHash) {
  const insightUrl = config.get('insightUrl')
  return `${insightUrl}/tx/${txHash}`
}

/**
 * Send a docproof confirmation email to the admins
 *
 * @param {string} digest Document digest hash
 * @param {string} txhash Transaction hash
 * @param {string} derivationPath Derivation path for the change address
 * @param {string} networkName Bitcoin network name, e.g. 'mainnet', 'test3'
 * @returns {Promise} A nodemailer promise
 */

function sendAdminDocproof (digest, txHash, derivationPath, networkName) {
  let txUrl = transactionUrl(networkName, txHash)

  var mailOptions = {
    from: config.get('mail.from'),
    to: config.get('mail.to'),
    subject: `[${config.get('app.site.title')}] Document ${digest} verified (${config.get('app.url.host')})`,
    text: `Document with hash ${digest} was verified in transaction ${txHash}`,
    html: `Document with hash ${digest} was verified in transaction ` + `<a href="${txUrl}">${txHash}</a> <br/>` + `Path for private key derivation is ${derivationPath} <br/> (${config.get('app.url.host')})`
  }

  return mail.sendMail(mailOptions)
}

module.exports = {
  sendAdminDocproof
}
