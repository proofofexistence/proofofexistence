# Proof of Existence

An online service to prove the existence of documents

## Instructions

### Setup

#### Mac OS X

- Install brew: https://brew.sh/
- brew install git (will trigger installation of Xcode, do it!)
- Follow guide https://treehouse.github.io/installation-guides/mac/node-mac.html
- Ready!

```sh
git clone git@github.com:poexio/proofofexistence.git
cd proofofexistence
```

### Requirements

```sh
npm install -g yarn
```

### Installation

```sh
yarn install
```

## Set up

```sh
node setup.js
```

Edit `.env` for environment variables.

### Running

```sh
npm start
```

The app will be listening at http://localhost:3003/.

### Production

Build the app:

```sh
npm run build
```

The production app is run with:

```sh
NODE_ENV=production npm run serve
```

To clean up:

```sh
npm run clean
```

## License

© Copyright 2017 PoEx Limited, all rights reserved.<br />
© Copyright 2015-2017 Smart Contract Solutions Inc., all rights reserved.
