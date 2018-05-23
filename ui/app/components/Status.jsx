import React, { Component } from 'react'
import btcConvert from 'bitcoin-convert'

import PaymentRequired from './status/PaymentRequired.jsx'
import Confirming from './status/Confirming.jsx'
import Confirmed from './status/Confirmed.jsx'

import { register, getStatus, updateStatus } from '@proofofexistence/api-client'

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

  getDocStatus (status) {
    if (status.pending === true && !status.txstamp) {
      return 'paymentRequired'
    } else if (status.txstamp && !status.blockstamp) {
      return 'confirming'
    } else if (status.blockstamp) {
      return 'confirmed'
    }
  }

  componentDidMount () {
    const { hash } = this.props

    getStatus(hash, { baseURL : null })
      .then(response => {
        const { data } = response
        const status = this.getDocStatus(data)
        this.setState({ status })

        switch (status) {
          case 'paymentRequired':
            this.handleShowPaymentRequired(data)
            break;
          case 'confirming':
            this.handleShowConfirmation(data)
            break;
          case 'confirmed':
            this.handleShowConfirmation(data)
            break;
          default:

        }
      })
      .catch(error => {
        // if the api returns 404, then register the hash
        if (error.status === 404)
          this.handleRegisterHash (hash, { baseUrl : null })
        else console.log(error)
      })
  }

  handleShowPaymentRequired (data) {
    const {
      payment_address,
      price
    } = data

    const BTCPrice = btcConvert(price, 'Satoshi', 'BTC')
    const mBTCPrice = btcConvert(price, 'Satoshi', 'mBTC')

    this.setState({
      BTCPrice,
      mBTCPrice,
      paymentAddress: payment_address,
      status: 'paymentRequired'
    })
  }

  handleShowConfirmation (data) {
    const {
      payment_address,
      price,
      tx,
      txstamp,
      blockstamp
    } = data

    const BTCPrice = btcConvert(price, 'Satoshi', 'BTC')
    const mBTCPrice = btcConvert(price, 'Satoshi', 'mBTC')

    this.setState({
      paymentAddress: payment_address,
      BTCPrice,
      mBTCPrice,
      tx,
      txstamp,
      blockstamp
    })
  }

  handleRegisterHash (hash) {
    register(hash, { baseURL : null })
      .then(response => {

        const { data } = response

        getStatus(hash, { baseURL : null })
          .then(statusResp => {
          const {
            payment_address,
            price
          } = statusResp.data

          const BTCPrice = btcConvert(price, 'Satoshi', 'BTC')
          const mBTCPrice = btcConvert(price, 'Satoshi', 'mBTC')

          this.setState({
            BTCPrice,
            mBTCPrice,
            paymentAddress: payment_address,
            status: 'paymentRequired'
          })
        })
        .catch(error => {
          console.log(error)
        })

      })
      .catch(error => {
        console.log(error);
      })
  }

  handleUpdateStatus (e) {
    e.preventDefault()

    const { hash } = this.props

    updateStatus(hash, { baseURL : null})
      .then(response => {
        const {
          tx,
          txstamp,
          blockstamp
        } = response.data

        const status = this.getDocStatus(response.data)

        this.setState({ tx, txstamp, blockstamp, status })

        console.log("updated", status)
      })
      .catch(error => {
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
