import React, { Component } from 'react'

import PaymentRequired from './status/PaymentRequired.jsx'
import Confirming from './status/Confirming.jsx'
import Confirmed from './status/Confirmed.jsx'

class Status extends Component {
  constructor (props) {
    super(props)

    this.statuses = [
      'default',
      'paymentRequired',
      'confirming',
      'confirmed'
    ]

    this.state = {
      paymentAddress: null,
      price: null,
      tx: null,
      txtime: null,
      blockstamp: null
    }
  }

  componentDidMount () {
    const {api, hash} = this.props

    api.register(hash,
      data => {
        console.log(data)
        const { success } = data

        if (success) {
          const {
            pay_address,
            price
           } = data

          this.setState({
            paymentAddress: pay_address,
            price,
            status: 'paymentRequired'
          })
        } else if (success === false && data.reason === 'existing') { // record already exist in local DB
          api.getStatus(hash,
            data => {
              console.log(data)

              const {
                payment_address,
                price,
                tx,
                txstamp,
                blockstamp,
                status
               } = data

              this.setState({
                paymentAddress: payment_address,
                status,
                price,
                tx,
                txstamp,
                blockstamp
              })
            }
          )
        }
      },
      err => console.log(err)
    )
  }

  handleUpdateStatus (e) {
    e.preventDefault()
    const { hash } = this.props
    this.props.api.updateStatus(
      hash,
      data => {
        console.log(data)
        const {
          tx,
          txstamp,
          blockstamp,
          status
        } = data
        this.setState({ tx, txstamp, blockstamp, status })
      },
      error => console.log(error)
    )
  }

  render () {
    const { hash } = this.props
    const {
      price,
      paymentAddress,
      tx,
      status
    } = this.state

    return (
      <div>
        {
          {
            'paymentRequired': (
              <PaymentRequired
                handleUpdateStatus={e => this.handleUpdateStatus(e)}
                price={price}
                paymentAddress={paymentAddress}
            />
          ),
            'confirming': (
              <Confirming
                handleUpdateStatus={e => this.handleUpdateStatus(e)}
              />
          ),
            'confirmed': (
              <Confirmed
                tx={tx}
              />
          )
          }[status]
        }
        <div class='card-body'>
          <a
            href={`/detail/${hash}`}
            title='Permalink to your document'
            class='card-link'
            >
            Permalink to your registration
          </a>
        </div>
      </div>
    )
  }
}

export default Status
