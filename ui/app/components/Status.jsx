import React, { Component } from 'react'
import btcConvert from 'bitcoin-convert'

import PaymentRequired from './status/PaymentRequired.jsx'
import Confirming from './status/Confirming.jsx'
import Confirmed from './status/Confirmed.jsx'

import { register, getStatus, updateStatus } from "@proofofexistence/api-client"


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
    const {hash} = this.props

    register(hash)
      .then(response => {
        const data = response.data
        const { success } = response.data

        if (success) {
          const {
            pay_address,
            price
          } = response.data

          const BTCPrice = btcConvert(price, 'Satoshi', 'BTC')
          const mBTCPrice = btcConvert(price, 'Satoshi', 'mBTC')

          this.setState({
            BTCPrice,
            mBTCPrice,
            paymentAddress: pay_address,
            status: 'paymentRequired'
          })
        } else if (success === false && data.reason === 'existing') { // record already exist in local DB
          getStatus(hash)
            .then( response => {
              const {
                payment_address,
                price,
                tx,
                txstamp,
                blockstamp,
                status
              } = response.data

              const BTCPrice = btcConvert(price, 'Satoshi', 'BTC')
              const mBTCPrice = btcConvert(price, 'Satoshi', 'mBTC')

              this.setState({
                paymentAddress: payment_address,
                status,
                BTCPrice,
                mBTCPrice,
                tx,
                txstamp,
                blockstamp
              })
            })
            .catch( error => {
              console.log(error);
            })
        }
      })
      .catch( error => {
        console.log(error);
      })
  }

  handleUpdateStatus (e) {
    e.preventDefault()
    const { hash } = this.props
    updateStatus(hash)
      .then( response => {
        const {
          tx,
          txstamp,
          blockstamp,
          status
        } = reponse.data
        this.setState({ tx, txstamp, blockstamp, status })
      })
      .catch( error => {
        console.log(error)
      })
  }

  render () {
    const { hash } = this.props
    const {
      BTCPrice,
      mBTCPrice,
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
                BTCPrice={BTCPrice}
                mBTCPrice={mBTCPrice}
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
