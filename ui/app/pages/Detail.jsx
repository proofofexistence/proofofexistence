import React from 'react'
import Status from '../components/Status.jsx'
import Docproofs from '../components/Docproofs.jsx'

const Detail = ({
  api,
  match
}) => (
  <div>
    <div class='row'>
      <div class='col-lg-12'>
        <Status
          hash={match.params.hash}
          api={api}
          />
      </div>
    </div>
    <div class='row'>
      <div class='col-lg-12'>
        <Docproofs
          hash={match.params.hash}
          api={api}
          />
      </div>
    </div>
  </div>
)

export default Detail
