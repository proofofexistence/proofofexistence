## [Unreleased]

# 1.8.1 - 2017-12-08

### Changed

* Wait for tx confirmation before showing proof message
* Link proof waiting message to transaction
* Remove incomplete weeks from web/api charts

# 1.8.0 - 2017-12-01

### Changed

* Restore babel packages
* Base mining pool update time on user hashrate
* Document sweep script
* Show test messsage only if not using livenet
* Move setup script to npm command
* Remove deprecated start script

## [1.7.0] - 2017-11-24

### Changed

* Calculate mining stats from Slushpool
* Dropped usage of babel-node
* Make bitcoin network configurable

## [1.6.2] - 2017-11-10

### Added

* Add charts for web access
* Keep track of weekly API access performance
* Added doc link for test.poex.io

## [1.6.1] - 2017-11-03

### Added

* Add helper script for making testnet payments

### Changed

* Link admin emails to tBTC transactions in test mode
* Replace BlockTrail links with BlockCypher
* Fix order of API access chart

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
