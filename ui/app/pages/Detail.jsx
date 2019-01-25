import React from 'react'
import Status from '../components/Status.jsx'

const Detail = ({
  match
}) => (
  <div>
    <div class='row' style={{ textAlign: 'center' }}>
      <div class='col-lg-12'>
        <Status
          hash={match.params.hash}
          />
      </div>
    </div>
  </div>
)

export default Detail
