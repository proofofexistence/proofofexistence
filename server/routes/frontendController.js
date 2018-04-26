'use strict'

const config = require('config')
const core = require('../../core')

function home (req, res) {
  res.render('index', { title: 'Home', active: { prove: true } })
}

function detail (req, res) {
  res.render('detail', {
    title: 'Document Information',
    active: { prove: true },
    insightUrl: config.get('insightUrl'),
    documentPriceMbtc: core.docproof.priceUnit.toMilis()
  })
}


module.exports = {
  about,
  contact,
  detail,
  developers,
  home,
  news,
  search
}
