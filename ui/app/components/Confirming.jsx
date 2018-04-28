import React from 'react'

const Confirming = ({
  tx
}) => (
  <p>
    A transaction embedding your document's digest has been broadcast to the Bitcoin network. Click the button below after the transaction is confirmed to complete the process.
    <span class="tx" class="digest">{tx}</span>

    <form class="refresh">
      <div class="form-group">
        <button type="submit" class="refreshSubmit btn btn-success btn-lg btn-fill">Complete Certification</button>
      </div>
    </form>
  </p>
)

export default Confirming
