const config = require('config')
const path = require('path')
const fs = require('fs')

const Handlebars = require('handlebars');

const indexSrcPath = path.resolve(__dirname, '../ui/views/index.hbs')
const indexHtmlPath = path.resolve(__dirname, '../ui/public/index.html')

fs.readFile(indexSrcPath, 'utf8', function (err, source) {
  if (err) throw err

  console.log("Parsing index.html file")

  const template = Handlebars.compile(source);
  const result = template(config.get('app.site'))

  fs.writeFile(indexHtmlPath, result, function(err) {
    if(err) throw err
    console.log("Index file created in /ui/public/index.html.");
  });

});
