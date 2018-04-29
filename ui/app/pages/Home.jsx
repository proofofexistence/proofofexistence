import React, { Component } from 'react';

import Jumbo from '../components/Jumbo.jsx';
import Search from '../components/Search.jsx';
import HashList from '../components/HashList.jsx';

import UploadFile from '../components/UploadFile.jsx';
import Status from '../components/Status.jsx';

import crypto from '../crypto';

class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
      hash: null
    }
  }

  componentDidMount() {
    this.props.api.getLatestUnconfirmed( unconfirmed =>
      this.setState({ unconfirmed })
    )

    this.props.api.getLatestConfirmed( confirmed =>
      this.setState({ confirmed })
    )
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
      var arrayBuffer = e.target.result;
      crypto.SHA256(arrayBuffer,
        p => {
          const hashingProgress = Math.round(p*100)
          this.setState({hashingProgress})
        },
        result => {
          const hash = result.toString()
          this.setState({ hash, hashingProgress: 100 })
        }
      )
    }
    reader.readAsText(file);
  }

  render() {

    const {
      showSearch,
      hash,
      unconfirmed,
      confirmed,
      hashingProgress,
      maxFileSize,
      files
    } = this.state

    const {
      site,
      api
    } = this.props

    return (
      <div>
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

          <div className="col-lg-4 ml-auto card">
            {
              !hash ?
                <UploadFile
                  maxFileSize={maxFileSize}
                  files={files}
                  handleToggleSearch={ (e) =>this.handleToggleSearch(e)}
                  handleAddFile={ (e) =>this.handleAddFile(e)}
                  hashingProgress={hashingProgress}
                  hash={hash}
                  />
                :
                <Status
                  hash={hash}
                  api={api}
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
                <HashList
                  records={unconfirmed}
                  />
            </div>
          </div>

          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Certifications</h3>
                <p class="card-category">Documents of proven existence, confirmed in the blockchain</p>
              </div>
              <HashList
                records={confirmed}
                checked={true}
                />
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default Home
