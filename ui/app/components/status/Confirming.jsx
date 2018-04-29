import React from 'react'

const Confirming = ({
  tx,
  handleUpdateStatus
}) => (
  <div class="card-body">
    <h3 class="card-title">Confirming</h3>
    <span class="badge badge-light">Confirming</span>
    <p class="card-text">
      A transaction embedding your document's digest has been broadcast to the Bitcoin network. Click the button below after the transaction is confirmed to complete the process.
    </p>
    <span class="tx" class="digest">{tx}</span>
    <a href="#"
      class="refreshSubmit btn btn-success btn-lg btn-fill"
      onClick={handleUpdateStatus}
      >
      Complete Certification
    </a>
  </div>
)

export default Confirming
