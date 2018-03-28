# Proof of Existence

An online service to prove the existence of documents

## Instructions

### Setup

#### Mac OS X

- Install brew: https://brew.sh/
- brew install git (will trigger installation of Xcode, do it!)
- Follow guide https://treehouse.github.io/installation-guides/mac/node-mac.html
- Ready!

#### Docker

- Install Docker CE: https://docs.docker.com/engine/installation/
- Build docker-node (`Only build it once`)
- Alternative is to install from brew: https://stackoverflow.com/questions/40523307/brew-install-docker-does-not-include-docker-engine

Download [Dockerfile](./Dockerfile), then build it in the same path.

```sh
wget https://raw.githubusercontent.com/proofofexistence/proofofexistence/master/Dockerfile
```

```sh
docker build -t docker-node .
```

- Start docker-node as daemon
```sh
docker run -d -i --rm --name docker-node -p 3003:3003 docker-node
```
- Attach to the docker-node
```
docker exec --user node -w /home/node -ti docker-node bash
```

### Installation

```sh
git clone git@github.com:proofofexistence/proofofexistence.git
cd proofofexistence
npm install
```

#### Configuration

```sh
npm run setup
```

Edit `.env` for environment variables. All values are **required**.

* `PORT` - The local port to run the app on.
* `HOST` - The host or domain name. (`NOTE: you maybe need to use ngrok`)
* `HOST_SCHEME` - e.g. `http` or `https`.
* `HOST_PORT` - e.g. `80` or `443`.
* `DB_PATH` - Path to the LevelDB directory.
* `DOCUMENT_PRICE` - Document certification price in satoshis.
* `FEE_MULTIPLIER` - Multiply estimated fee by this value to change its
  priority. Defaults to `2`.
* `BLOCKCYPHER_TOKEN` - BlockCypher API token, Register it [here](https://www.blockcypher.com/).
* `BITCOIN_NETWORK` - Default bitcoin network for Bitcore. Options are `livenet`
  or `testnet`.
* `BITCOIN_HD_PRIVATE_KEY` - HD wallet private key to handle incoming payments.
* `BITCOIN_HD_PUBLIC_KEY` - HD wallet public key to accept outgoing payments.
* `MAGIC_NUMBER` - Token for some private API routes.
* `MAIL_FROM` - Name/email to send as.
* `MAIL_TO` - Email address to send notifications to.
* `GMAIL_USER` - GMail account for sending notifications.
* `GMAIL_PASS` - Gmail password for sending notifications.

Any environment variables that are set when the app is run will override the
values in the `.env` file.

**Note**: You must create two different HD wallets. The first wallet is the
*Incoming* wallet, which is used to generate payment addresses for the user, and
to sign transactions embedding docproofs. The second wallet is the *Outgoing*
wallet, which is used to generate addresses where the change from docproof
transactions is sent.

The private key for the *Incoming* wallet must be the `BITCOIN_HD_PRIVATE_KEY`.

The public key for the *Outoing* wallet must be `BITCOIN_HD_PUBLIC_KEY`. The
private key for the change wallet should be kept secret, and can be used later
to sweep the funds.

### Building

```sh
npm run build
```

### Running

```sh
npm start
```

The app will be listening at http://localhost:3003/.

### Testing

Create a `.env.test` file with the desired configuration. It is recommended to
change the database path to a `/tmp` location.

Run the tests with:

```sh
npm test
```

### Development

To run the app in development mode, create a `.env.dev` file with the desired
configuration.

You must use a **Testnet3 wallet** for the public and private keys. It is
recommended to change the database path to a `/tmp` location.

Run the app in dev mode with:

```sh
NODE_ENV=dev npm run watch
```

#### ngrok

To test all functionality, the dev app running locally needs to be able to
receive web hook requests from the Internet.

Sign up for an [ngrok](https://ngrok.com) account, download the client, and
connect it to your account. Run `ngrok` with the port from your `.env.test`
file:

```sh
ngrok http 3003
```

Note the "Forwarding" address and run the app with:

```sh
NODE_ENV=development HOST=xxxxxxxx.ngrok.io HOST_SCHEME=https HOST_PORT=443 npm run watch
```

#### Test Certifications

Finally, to certify a document on the testnet blockchain:

1. Create a `.env.dev` file with all your configuration
1. Set up a new testnet wallet and note down the Private Key WIF
1. Fund the testnet wallet, e.g. using a Bitcoin testnet3 faucet
1. Run the app locally in dev mode, with ngrok active
1. Submit a document hash to the running app on localhost
1. Note down the target address for payment
1. Send payment with `node scripts/payment.js PRIVATE_KEY_WIF TARGET_ADDRESS`
1. Wait for the transaction to be confirmed on testnet blockchain

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

### Service

The app can be run as a systemd service with a startup script such as:

```
[Unit]
Description=Poex prod
After=network.target

[Service]
WorkingDirectory=/home/ubuntu/poex/
Environment="NODE_ENV=production"
Environment="PORT=3003"
Type=simple
User=ubuntu
ExecStart=/usr/bin/node /home/ubuntu/poex/lib/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### Deployment

```sh
ssh ubuntu@poex.io
cd /home/ubuntu/poex/
git pull origin master
npm install
npm run build
sudo service poex_prod restart
```

### Webhooks

Webhooks can be purged by running:

```sh
node purge.js
```

### News

The `/news` route should be handled by [proofofexistence/news]. This can be
configured in Nginx with a directive like:

```
location /news {
        alias /home/ubuntu/news/_site;
        error_page 404 /news/404.html;
}
```

## Extracting funds

To extract the funds from the app you should:

1. From the project's root directory, run:

  ```sh
  curl -X POST https://poex.io/sweep/$MAGIC_NUMBER > /tmp/poex-paths.txt
  ```

2. Run

  ```
  npm run sweep
  ```

When prompted, enter these:

* hdPrivateKey - the master extended private key that is paired with the
  `BITCOIN_HD_PUBLIC_KEY` from the `.env` file
* file - the `/tmp/poex-paths.txt` file generated in step 1
* address - bitcoin address where you want to send funds to

## FAQ

1. How can I get my `BITCOIN_HD_PRIVATE_KEY` and `BITCOIN_HD_PUBLIC_KEY`?

For now, the [bcwallet](https://github.com/blockcypher/bcwallet) is the best choice.

When you start the wallet, choose the type of network, then you should get all of these.

2. It always show 'Waiting for payment' even I send the payment in my local PoEx node

Because the core code use webhooks from BlockCypher, please check the status of webhooks

See [List WebHooks Endpoint](https://www.blockcypher.com/dev/bitcoin/#using-webhooks), It usually happened with incorrect HOST or PORT setting in the .env

## License

© Copyright 2017-2018 Proof Of Existence, all rights reserved.<br />
© Copyright 2015-2017 Smart Contract Solutions Inc., all rights reserved.

[proofofexistence/news]: https://github.com/proofofexistence/news
