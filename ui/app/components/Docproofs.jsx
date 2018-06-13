import React, { Component } from 'react'

import { docproofs } from '@proofofexistence/api-client'

class Docproofs extends Component {
  constructor (props) {
    super(props)
    this.state = {
      txs: [],
      message: 'Fetching data from the blockchain. Please wait.'
    }
  }

  componentDidMount () {
    const { hash } = this.props
    docproofs(hash, { baseURL: null })
      .then(response => {
        this.setState({
          txs: response.data.items,
          message: 'Blockchain transactions embedding this document hash.'
        })
      })
      .catch(error => {
        console.log(error)
        this.setState({
          txs: [],
          message: 'No transactions available.'
        })
      })
  }

  render () {
    return (
      <div class='card'>
        <div class='card-header'>
          <h3 class='card-title'>
            Docproofs
          </h3>
          <p class='card-category'>
            {this.state.message}
          </p>
        </div>
        <div class='card-body table-responsive table-full-width'>
          <table class='table table-striped docproofs-table'>
            <thead>
              {
                this.state.txs.length > 0
                  ? <tr><th /><th>Block Height</th><th>Transaction ID</th><th className='d-none d-md-table-cell'>Block Time</th><th className='d-none d-md-table-cell'>Confirmations</th></tr>
                  : null
              }
            </thead>
            <tbody>
              {
                this.state.txs.map(tx => (
                  <tr key={tx.txid}>
                    <td>
                      <span class='label label-success'>✔</span>
                    </td>
                    <td className='no-wrap'>
                      {tx.blockheight}
                    </td>
                    <td>
                      {tx.txid}
                    </td>
                    <td className='d-none d-md-table-cell'>
                      {new Date(tx.blocktime * 1000).toUTCString()}
                    </td>
                    <td className='no-wrap d-none d-md-table-cell'>
                      {tx.confirmations}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Docproofs
