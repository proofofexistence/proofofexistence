import React from 'react'

const Confirming = ({
  tx,
  handleUpdateStatus
}) => (
  <div class='card-body'>
    <span class='badge badge-light'>Confirming</span>
    <p class='card-text'>
      A transaction embedding your document's digest has been broadcast to the Bitcoin network. Click the button below after the transaction is confirmed to complete the process.
    </p>
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
      <a href='#'
        class='refreshSubmit btn btn-success btn-fill'
        onClick={handleUpdateStatus}
      >
      Complete Certification
      </a>
    </div>
  </div>
)

export default Confirming
