# Changelog


## 1.13.5 - 2018-05-30

* use 'api-client' lib from npm

## 1.13.4 - 2018-05-21

* add support for Telegram groups

## 1.13.3 - 2018-05-15

* request docproof and txs data from insight server using specialops lib
* introduce docproof UI component

## 1.13.2 - 2018-05-08

* bring back QR codes

## 1.13.1 - 2018-05-08

* fix wrong price display in mBTC

## 1.13 - 2018-05-02

See #16 for details

* rewrite UI into React frontend App
* init API client
* split routes into separate reps

## 1.12.2 - 2018-04-11

* Better search feature

## 1.12.1 - 2018-04-09

* Cosmetics and some UI graphic design

## 1.12.0 - 2018-04-09

* Replace Blockcypher API by Insight API
* Social media icons and footer

## 1.11.2 - 2018-04-05

* Remove sidebar and about page
* Simpler config files

## 1.11.1 - 2018-03-26

### Fixed

* Fix incorrect count of output index

## 1.11.0 - 2018-03-20

### Added

* Upgrade theme to Bootstrap 4
* Register document using only the hash
* Search for documents by hash
* White version of animated logo

### Fixed

* Purge script can catch delete hook errors

## 1.10.7 - 2018-03-16

### Added

* Make light-bootstrap-dashboard CSS available.

## 1.10.6 - 2018-03-09

### Changed

* A POST request to the status resource will refresh the document, creating or
  confirming a docproof if possible

### Fixed

* Status query route

### Removed

* Register hash route
* resubmit script

## 1.10.5 - 2018-03-02

### Added

* Allow registering document from detail page if it's missing

### Changed

* Factored out web, controllers, and core modules
* Return 404 when getting a missing document status
* Validate length of document digest

### Removed

* API get routes

## 1.10.4 - 2018-02-26

### Fixed

* Switch purge script to blockcypher client module

## 1.10.3 - 2018-02-23

### Changed

* Switch to @poexio/blockcypher package
* Use documnted register and status API resources on frontend

### Removed

* JS files from sign feature

## 1.10.2 - 2018-02-09

### Added

* Let payment test script send arbitary amounts

### Changed

* Increase estimate of docproof tx to 242 bytes
* Calculate tx fee during docproof creation instead of registration

### Fixed

* Better handling of errors during unconfirmed processing

## 1.10.1 - 2018-02-02

### Changed

* Parse FEE_MULTIPLIER env as float
* Serve paper dashboard copy of bootstrap css

### Removed

* Glyphicon usage
* List of press on About page

## 1.10.0 - 2018-01-26

### Added

* Config for fee multiplier, site description
* Facebook and Twitter meta tags
* BlockCypher client wrapper module
* Support node-config for all config

### Changed

* Upgrade to bitcore-lib 0.15.0
* Switch to paper-dashboard npm package

### Fixed

* Hide default ports 80 and 443 in doc examples
* Corrected timezone of submission list

### Removed

* Signing feature from v1 API
* Original tools/sweep.js script
* Babel, bluebird, popsicle, bitcore-explorers deps

## 1.9.0 - 2018-01-12

### Added

* Make sweep command prompt for master private key
* Add instructions for running with Docker
* Add testing framework

### Changed

* Move test payment helper into scripts directory
* Include price demonimated in satoshis in docproof status payload, and drop
  payment amount in mBTC

## 1.8.2 - 2018-01-03

### Changed

* Increase transaction fee security margin and fee per kb

## 1.8.1 - 2017-12-08

### Changed

* Wait for tx confirmation before showing proof message
* Link proof waiting message to transaction

## 1.8.0 - 2017-12-01

### Changed

* Restore babel packages
* Document sweep script
* Show test messsage only if not using livenet
* Move setup script to npm command
* Remove deprecated start script

## [1.7.0] - 2017-11-24

### Changed

* Dropped usage of babel-node
* Make bitcoin network configurable

## [1.6.2] - 2017-11-10

### Added

* Added doc link for test.poex.io

## [1.6.1] - 2017-11-03

### Added

* Add helper script for making testnet payments

### Changed

* Link admin emails to tBTC transactions in test mode
* Replace BlockTrail links with BlockCypher

## [1.6.0] - 2017-10-27

### Added

* Environment specific `.env` files
* Mode for running in test environment with testnet

### Changed

* Dropped Google Analytics

## [1.5.0] - 2017-10-20

### Changed

* Return more transactions from blockcypher API
* Stop serving vendored libs from node

## [1.4.0] - 2017-10-13

### Added

* Link to /news page, which should be served by poex-news.

### Changed

* Serve vendored assets from public directory.
* Switch notification email from bitpay.com to blocktrail.com.

## [1.3.0] - 2017-10-06

### Added

* Add moment.js

## [1.2.1] - 2017-09-29

### Added

* Show message if JavaScript is disabled

### Changed

* Show block timestamp in last confirmed list instead of submission time

## [1.2.0] - 2017-09-22

### Added

* Environment configuration for host, bitcoin and API keys, prices, database,
  email, and tracking

### Changed

* Revert to NPM for dependency management

## [1.1.0] - 2017-09-15

### Added

* Paper Dashboard theme
* Custom error pages
* Port set by environment variable
* Add start, build, and serve scripts

### Changed

* Use Handlebars for templates
* Switch to yarn for dependency management
* Upgrade to Bootstrap 3
* Only output Google analytics in production

### Fixed

* Change package to "UNLICENSED"
* Update QR code price to 2 mBTC
