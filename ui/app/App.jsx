import React, { Component } from 'react';

import Navbar from './components/Navbar.jsx';
import Jumbo from './components/Jumbo.jsx';
import UploadFile from './components/UploadFile.jsx';
import Search from './components/Search.jsx';
import HashList from './components/HashList.jsx';
import Footer from './components/Footer.jsx';

import PaymentRequired from './components/status/PaymentRequired.jsx'
import Confirming from './components/status/Confirming.jsx'
import Confirmed from './components/status/Confirmed.jsx'

import crypto from './crypto';

class App extends Component {

  constructor(props) {
    super(props);

    this.statuses = [
      'default',
      'paymentRequired',
      'confirming',
      'confirmed'
    ]

    this.state = {

      // app config
      config : {
        site : {},
        social : {},
        isTestnet: true,
        defaultNetwork: "testnet",
        version: null
      },

      // UI state
      showSearch: false,
      unconfirmed : [],
      confirmed: [],

      // files options
      maxFileSize:0,
      files: [],

      // state machine
      status: 'default',

      hashingProgress:0,
      hash: null,

      // data
      // digest: null,
      payAdress: null,
      price: null,
      tx: null,
      txtime:null
    }
  }

  setStatus(status) {
    if (this.statuses.indexOf(status) == -1) throw Error(`Status "${status}" does not exist.`)
    else this.setState({status})
  }

  componentDidMount() {
    this.props.api.getConfig( config => {
      this.setState({ config })
    })

    this.props.api.getLatestUnconfirmed( unconfirmed => {
      console.log(unconfirmed);
      this.setState({ unconfirmed })
    })

    this.props.api.getLatestConfirmed( confirmed => {
      console.log(confirmed);
      this.setState({ confirmed })
    })
  }

  handleToggleSearch(e) {
    e.preventDefault()
    this.setState({ showSearch : !this.state.showSearch })
  }

  handleAddFile(files) {
    this.setState({files})

    const file = files[0];
    var reader = new FileReader();

    reader.onload = e => {
      // console.log(e);
      var arrayBuffer = e.target.result;
      crypto.SHA256(arrayBuffer,
        p => {
          const hashingProgress = Math.round(p*100)
          this.setState({hashingProgress})
        },
        result => {
          const hash = result.toString()
          this.setState({ hash, hashingProgress: 100 })
          this.handleRegister(hash)
        }
      )
    }
    reader.readAsText(file);
  }

  handleRegister(hash) {
    this.props.api.register(hash,
      data => {
        console.log(data);
        const { success } = data

        if (success == true) {

          const { digest, payAdress, price } = data
          this.setState({payAdress, price })
          this.setStatus("paymentRequired")

        } else if (success == false && data.reason == "existing") { // record already exist in local DB
          this.props.api.getStatus(hash,
            data => {
              console.log(data);

              const {
                payment_address,
                price,
                timestamp,
                // digest,
                tx,
                pending,
                txstamp,
                blockstamp
               } = data

              if (pending == true && !txstamp) {
                this.setStatus('paymentRequired')
                this.setState({
                  payAdress: payment_address,
                  price
                })
              }
              else if (txstamp && ! blockstamp) {
                // console.log('Already confirmed in BNTC blockchain!')
                this.setStatus('confirming')
                this.setState({
                  tx,
                  txstamp
                })
              } else if ( blockstamp) {
                this.setStatus('confirmed')
                this.setState({
                  tx,
                  txstamp,
                  blockstamp
                })
              }
            }
          )
        }
      },
      err => console.log(err)
    )
  }

  handleUpdateStatus(e) {
    e.preventDefault()
    const { hash } = this.state
    console.log(hash);
    this.props.api.updateStatus(
      hash,
      data => {
        const { tx, txstamp, pending } = data
        this.setState({ tx, txstamp, pending })
      },
      error => console.log(error)
    )
  }

  render() {
    const {
      config,
      showSearch,
      registered,
      digest,
      payAdress,
      price,
      registering
    } = this.state

    const {
      site,
      social,
      isTestnet,
      defaultNetwork,
      version
    } = config

    return (
      <div className="App container">
        <Navbar
          brand={site.brand}
          logo={site.logo}
          isTestnet={isTestnet}
          defaultNetwork={defaultNetwork}
          />
        <Jumbo
          logo={site.logo}
          brand={site.brand}
          slogan={site.slogan}
          tagline={site.tagline}
          />

        <div id="uploads" className="row">
          <div class="no-border card col-lg-6">
            <h3 class="card-title">
              Select a document and have it certified in the Bitcoin blockchain
              <br />
              <small>
                <span>
                  If it has been certified already, you will be redirected to the original record.
                </span>
                <br />
                {
                  // <a href="" data-toggle="modal" data-target="#helpModal">
                  //   Learn more.
                  // </a>
                }
              </small>
            </h3>
          </div>

          <div className="col-lg-4 ml-auto">
            {{
              'default': (
                <UploadFile
                  maxFileSize={this.state.maxFileSize}
                  files={this.state.files}
                  handleToggleSearch={ (e) =>this.handleToggleSearch(e)}
                  handleAddFile={ (e) =>this.handleAddFile(e)}
                  hashingProgress={this.state.hashingProgress}
                  hash={this.state.hash}
                  />
              ),
              'paymentRequired': (
                <PaymentRequired
                  handleUpdateStatus={e => this.handleUpdateStatus(e)}
                  price={price}
                  digest={digest}
                  payAdress={payAdress}
                />
              ),
              'confirming': (
                <Confirming
                  handleUpdateStatus={e => this.handleUpdateStatus(e)}
                  />
              ),
              'confirmed': (
                <Confirmed
                  tx={this.state.tx}
                  />
              )
            }[this.state.status]}
          </div>
        </div>
        {
          showSearch ?
            <Search />
            :
            null
        }

        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Ongoing Submissions</h3>
                <p class="card-category">Documents already registered for certification, waiting for payments.</p>
                </div>
                <HashList />
            </div>
          </div>

          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Certifications</h3>
                <p class="card-category">Documents of proven existence, confirmed in the blockchain</p>
              </div>
              <HashList />
            </div>
          </div>
        </div>

        <Footer
          twitter={social.twitter}
          github={social.github}
          facebook={social.facebook}
          email={social.email}
          year={site.year}
          version={version}
          />
      </div>
    );
  }
}

export default App;
