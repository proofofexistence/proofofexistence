#!/bin/bash
mkdir -p public/vendor
cp -R node_modules/jquery/dist public/vendor/jquery
cp -R node_modules/jquery-form/ public/vendor/jquery-form
cp -R node_modules/bootstrap/dist/ public/vendor/bootstrap
cp -R node_modules/paper-dashboard/assets/ public/vendor/paper-dashboard
cp -R node_modules/sprintf-js/dist public/vendor/sprintf-js
cp -R node_modules/openpgp/dist public/vendor/openpgp
cp -R node_modules/qrcodejs public/vendor/qrcodejs
cp -R node_modules/clipboard/dist public/vendor/clipboard
cp -R node_modules/moment/min public/vendor/moment
cp node_modules/bitcoin-convert/dist/bitcoin-convert.min.js public/vendor
