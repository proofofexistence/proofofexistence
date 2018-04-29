import React from 'react'

const Payment = ({
  handleUpdateStatus,
  payAdress,
  price
}) => (
  <div>
    <p>
    Please send <strong>{price} mBTC</strong> or more to:
    <strong id='payment_link'>
        {payAdress}
    </strong>
    </p>

    <p>
      After sending your payment, click the button below to continue the document certification process.
    </p>

    <form class="refresh">
      <div class="form-group">
        <button
          type="submit"
          className="refreshSubmit btn btn-info btn-lm btn-fill"
          onClick={handleUpdateStatus}
          >
          Continue Certification
        </button>
      </div>
    </form>
  </div>
)

export default Payment
