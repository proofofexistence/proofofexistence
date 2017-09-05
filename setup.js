'use strict';

/**
 * Copy .sample-env to .env but do not overwrite it.
 */

var fs = require('fs');
fs.createReadStream('.sample-env')
  .pipe(fs.createWriteStream('.env', { flags: 'wx' }));
