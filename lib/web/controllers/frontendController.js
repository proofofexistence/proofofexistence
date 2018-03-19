'use strict'

const config = require('config')
const core = require('../../core')

function home (req, res) {
  res.render('index', { title: 'Home', active: { prove: true } })
}

function about (req, res) {
  res.render('about', { title: 'About', active: { about: true } })
}

function developers (req, res) {
  res.render('developers', {
    title: 'API',
    active: { developers: true },
    hostUrl: config.get('hostUrl'),
    documentPrice: config.get('documentPrice')
  })
}

function contact (req, res) {
  res.render('contact', { title: 'Contact', active: { contact: true } })
}

function detail (req, res) {
  res.render('detail', {
    title: 'Document Information',
    active: { prove: true },
    documentPriceMbtc: core.docproof.priceUnit.toMilis()
  })
}

function news (req, res) {
  res.render('news', { title: 'News', active: { news: true } })
}

function search (req, res) {
  if (req.body.digest) {
    res.redirect(`/detail/${req.body.digest}`)
  } else {
    res.render('search', { title: 'Search', active: { search: true } })
  }
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
