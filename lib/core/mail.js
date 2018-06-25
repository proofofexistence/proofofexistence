'use strict'

var config = require('config')
const nodemailer = require('nodemailer')

const MailTransport = nodemailer.createTransport

let mailOptions = {}
if (config.get('nodemailer.options')) {
  mailOptions = config.get('nodemailer.options')
} else {
  mailOptions = {jsonTransport: true}
}

const mail = new MailTransport(mailOptions)

/**
 * Generate a tranaction URL on a block explorer
 */

function transactionUrl (txHash) {
  const insightUrl = config.get('insightUrl')
  return `${insightUrl}/tx/${txHash}`
}

/**
 * Send a docproof confirmation email to the admins
 *
 * @param {string} digest Document digest hash
 * @param {string} txhash Transaction hash
 * @param {string} derivationPath Derivation path for the change address
 * @returns {Promise} A nodemailer promise
 */

function sendAdminDocproof (digest, txHash, derivationPath) {
  let txUrl = transactionUrl(txHash)

  var mailOptions = {
    from: config.get('mail.from'),
    to: config.get('mail.to'),
    subject: `[${config.get('app.site.title')}] Document ${digest} verified (${config.get('app.url.host')})`,
    text: `Document with hash ${digest} was verified in transaction ${txHash}`,
    html: `Document with hash ${digest} was verified in transaction ` + `<a href="${txUrl}">${txHash}</a> <br/>` + `Path for private key derivation is ${derivationPath} <br/> (${config.get('app.url.host')})`
  }

  return mail.sendMail(mailOptions)
}

/**
 * Send a docproof price email to the admins
 *
 * @param {number} oldPrice The old document price
 * @param {number} newPrice The new document price
 * @param {string} chainName Bitcoin chain name
 * @param {string} networkName Bitcoin network name
 * @returns {Promise} A nodemailer promise
 */

function sendAdminPrice (oldPrice, newPrice, chainName, networkName) {
  var mailOptions = {
    from: config.get('mail.from'),
    to: config.get('mail.to'),
    subject: `[${config.get('app.site.title')}] Price change alert ${oldPrice} to ${newPrice}`,
    text: `Old price: ${oldPrice}, New price: ${newPrice} (${networkName} ${chainName})`,
    html: `Old price: ${oldPrice} satoshis<br /> New price: ${newPrice} satoshis<br /> Chain: ${chainName} <br/> Network: ${networkName} <br/><br/> (${config.get('app.url.host')})`
  }

  return mail.sendMail(mailOptions)
}

module.exports = {
  sendAdminDocproof,
  sendAdminPrice
}
