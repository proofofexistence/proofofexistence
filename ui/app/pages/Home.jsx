import React, { Component } from 'react'

import Jumbo from '../components/Jumbo.jsx'
import Search from '../components/Search.jsx'
import HashList from '../components/HashList.jsx'

import UploadFile from '../components/UploadFile.jsx'
import Status from '../components/Status.jsx'

import crypto from '../crypto'

import { getLatestConfirmed, getLatestUnconfirmed } from '@proofofexistence/api-client'

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // UI state
      showSearch: false,
      unconfirmed: [],
      confirmed: [],

      // files options
      files: [],

      // state machine
      status: 'default',
      hashingProgress: 0,
      hash: null
    }
  }

  componentDidMount () {
    getLatestConfirmed({ baseURL: null })
      .then(response => {
        let confirmed = response.data
        this.setState({ confirmed })
      })
      .catch(function (error) {
        console.log(error)
      })

    getLatestUnconfirmed({ baseURL: null })
      .then(response => {
        let unconfirmed = response.data
        this.setState({ unconfirmed })
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  handleToggleSearch (e) {
    e.preventDefault()
    this.setState({ showSearch: !this.state.showSearch })
  }

  handleSearch (e) {
    e.preventDefault()
    const hash = e.target.elements.hash.value
    this.setState({hash})
  }

  handleAddFile (files) {
    this.setState({files})

    const file = files[0]
    var reader = new window.FileReader()

    reader.onload = e => {
      var arrayBuffer = e.target.result
      crypto.SHA256(arrayBuffer,
        p => {
          const hashingProgress = Math.round(p * 100)
          this.setState({hashingProgress})
        },
        result => {
          const hash = result.toString()
          this.setState({ hash, hashingProgress: 100 })
        }
      )
    }
    reader.readAsBinaryString(file)
  }

  render () {
    const {
      showSearch,
      hash,
      unconfirmed,
      confirmed,
      hashingProgress,
      files
    } = this.state

    const {
      logo,
      brand,
      slogan,
      tagline,
      docproofPrice
    } = this.props

    return (
      <div>
        <Jumbo
          logo={logo}
          brand={brand}
          slogan={slogan}
          tagline={tagline}
          />

        <div
          id='uploads'
          className='row justify-content-md-center'
          style={{textAlign: 'center'}}
          >
          <h3 class='card-title'>
            Select a document and have it certified in the Bitcoin blockchain<br />
            Only {docproofPrice.amount} {docproofPrice.code}
          </h3>
          <div className='card col-lg-8 no-border' style={{margin: 0}}>

            <div className='no-border'>
              {
                !hash
                  ? <UploadFile
                    files={files}
                    handleToggleSearch={(e) => this.handleToggleSearch(e)}
                    handleAddFile={(e) => this.handleAddFile(e)}
                    hashingProgress={hashingProgress}
                    hash={hash}
                    maxFileSize={
                      150 // in Mo
                    }
                    />
                  : <Status
                    hash={hash}

                    />
                }
            </div>
            {
              showSearch
                ? <Search
                  hash={hash}
                  handleSearch={(e) => this.handleSearch(e)}
                  />
                : null
            }
          </div>
        </div>

        <div class='row'>
          <div class='col-md-6'>
            <div class='card'>
              <div class='card-header'>
                <h3 class='card-title'>Ongoing Submissions</h3>
                <p class='card-category'>Documents already registered for certification, waiting for payments.</p>
              </div>
              <HashList
                records={unconfirmed}
                  />
            </div>
          </div>

          <div class='col-md-6'>
            <div class='card'>
              <div class='card-header'>
                <h3 class='card-title'>Certifications</h3>
                <p class='card-category'>Documents of proven existence, confirmed in the blockchain</p>
              </div>
              <HashList
                records={confirmed}
                checked
                />
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default Home
