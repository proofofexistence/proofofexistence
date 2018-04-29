import React from 'react'

const Payment = ({
  handleUpdateStatus,
  paymentAddress,
  price
}) => (
  <div class="card-body">
    <span class="badge badge-info">Payment Required</span>

    <p class="card-text">
      Please send <strong>{price} mBTC</strong> to
    </p>
    <p>
      <strong id='payment_link'>
          {paymentAddress}
      </strong>
    </p>

    <p>
      After sending your payment, click the button below to continue the document certification process.
    </p>

    <a href="#"
      class="btn btn-info btn-fill"
      onClick={handleUpdateStatus}
      >
      Continue Certification
    </a>
  </div>
)

export default Payment
