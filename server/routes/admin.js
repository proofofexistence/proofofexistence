const db = require('../../lib/db')

function alldb (req, res) {
  db.createReadStream({})
    .on('data', data => {
      res.write(data.key + ' ' + data.value + '\n')
    })
    .on('error', () => null)
    .on('close', () => null)
    .on('end', () => {
      res.end()
    })
}

function sweep (req, res) {
  var paths = ''
  var writeOps = []

  db.createReadStream({
    gt: 'pending-sweep',
    lt: 'pending-sweep~'
  })
    .on('data', data => {
      paths += data.value + '\n'
      writeOps.push({
        type: 'del',
        key: data.key
      })
      writeOps.push({
        type: 'put',
        key: 'swept-' + data.key,
        value: data.value
      })
    })
    .on('error', () => null)
    .on('close', () => null)
    .on('end', () => {
      db.batch(writeOps, (err) => {
        if (err) {
          console.log('Error while fetching txs', err)
        } else {
          res.send(paths).end()
        }
      })
    })
}

function dbClose () {
  db.close()
}
module.exports = {
  alldb,
  sweep,
  dbClose
}
