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
        {tx}
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
