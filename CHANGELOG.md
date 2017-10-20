## [Unreleased]

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
