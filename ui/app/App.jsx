import React, { Component } from 'react';

import Navbar from './components/Navbar.jsx';
import Jumbo from './components/Jumbo.jsx';
import UploadFile from './components/UploadFile.jsx';
import Search from './components/Search.jsx';
import HashList from './components/HashList.jsx';
import Footer from './components/Footer.jsx';

import Payment from './components/Payment.jsx'
import Confirming from './components/Confirming.jsx'
import Confirmed from './components/Confirmed.jsx'

import crypto from './crypto';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      config : {
        site : {},
        social : {},
        isTestnet: true,
        defaultNetwork: "testnet",
        version: null
      },
      maxFileSize:0,
      showSearch: false,
      unconfirmed : [],
      confirmed: [],
      files: [],

      hashingProgress:0,
      hash: null,
      registered: false,

      digest: null,
      payAdress: null,
      price: null,

      registering: false,
      tx: null,
      confimed: false
    }
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
    console.log(hash)
    this.props.api.register(hash,
      data => {
        const { success } = data

        if (success == true) {
          const { digest, payAdress, price } = data
          this.setState({digest, payAdress, price, registered: true })
        } else if (success == false && data.reason == "existing") {
          this.props.api.getStatus(hash,
            data => {
              const { payment_address, price, digest, pending } = data
              if (pending == true)
                this.setState({
                  digest,
                  price,
                  payAdress: payment_address,
                  registered: true
                })
              else {
                console.log('Already confirmed in BNTC blockchain!')
                this.setState({registering: true})
              }
            }
          )
          // this.setState({digest, payAdress, price, registered: true })
        }
      },
      err => console.log(err)
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
            {
              !registered ?
                <UploadFile
                  maxFileSize={this.state.maxFileSize}
                  files={this.state.files}
                  handleToggleSearch={ (e) =>this.handleToggleSearch(e)}
                  handleAddFile={ (e) =>this.handleAddFile(e)}
                  hashingProgress={this.state.hashingProgress}
                  hash={this.state.hash}
                  />
                :
                  registering?
                    <Confirming
                      tx={tx}
                      />
                    :
                    <Payment
                    price={price}
                    digest={digest}
                    payAdress={payAdress}
                    />

            }

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
