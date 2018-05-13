import React, { Component } from 'react'

class Docproofs extends Component {
  constructor (props) {
    super(props)

    this.state = {txs: [], message: ''}
  }

  componentDidMount () {
    const {api, hash} = this.props

    api.getDocproofs(hash, data => {
      this.setState({txs: data.items, message: 'Blockchain transactions embedding this document hash.'})
    }, () => {
      this.setState({txs: [], message: 'No transactions available.'})
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
          <table class='table table-striped'>
            <thead>
              {
                this.state.txs.length > 0
                  ? <tr><th /><th>Block Height</th><th>Transaction ID</th></tr>
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
                    <td>
                      {tx.blockheight}
                    </td>
                    <td>
                      {tx.txid}
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
