import React from 'react'

const Confirmed = ({
  tx
}) => (
  <div id='confirmed_message'>
    <div class='card-body'>
      <span class='badge badge-success'>Certified</span>
      <h3 class='card-title'>Congratulations!</h3>
      <p class='card-text'>This document's digest was successfully embedded in the Bitcoin blockchain. It is now permanently certified and proven to exist since the transaction was confirmed.</p>
    </div>
    <ul class='list-group list-group-flush'>
      <li class='list-group-item'>
        <span class='badge badge-light'>Transaction ID: </span>{tx}
        <br />
      </li>
      {/* NOTE: Only support btc mainnet */}
      <li class='list-group-item'>
        <span class='badge badge-light'>Transaction Detail: </span>
        <a class='btn btn-primary' target='_blank' style={{ marginLeft: '.8em' }} href={`https://insight.bitpay.com/tx/${tx}`}>insight</a>
        <a class='btn btn-primary' target='_blank' style={{ marginLeft: '.8em' }} href={`https://www.smartbit.com.au/tx/${tx}`}>smartbit</a>
        <a class='btn btn-primary' target='_blank' style={{ marginLeft: '.8em' }} href={`https://www.blockchain.com/btc/tx/${tx}`}>BLOCKCHAIN</a>
        <a class='btn btn-primary' target='_blank' style={{ marginLeft: '.8em' }} href={`https://live.blockcypher.com/btc/tx/${tx}`}>BLOCKCYPHER</a>
        <br />
      </li>
    </ul>
    <div class='card-body'>

      <p class='card-category'>To verify this document again, just re-submit it here.
      </p>
    </div>
  </div>
)

export default Confirmed
