import React, { Component } from 'react';

import Navbar from './components/Navbar.jsx';
import Jumbo from './components/Jumbo.jsx';
import UploadFile from './components/UploadFile.jsx';
import Search from './components/Search.jsx';
import HashList from './components/HashList.jsx';
import Footer from './components/Footer.jsx';

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
      showSearch: false
    }
  }

  componentDidMount() {
    this.props.api.getConfig( config => {
      this.setState({ config })
    })
  }

  handleToggleSearch(e) {
    e.preventDefault()
    this.setState({ showSearch : !this.state.showSearch })
  }


  render() {
    const {
      config,
      showSearch
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
            <UploadFile
              handleToggleSearch={ (e) =>this.handleToggleSearch(e)}
              />
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
