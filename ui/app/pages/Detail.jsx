import React from 'react'
import Status from '../components/Status.jsx'

const Detail = ({
  api,
  match
}) => (
  <div>
    <Status
      hash={match.params.hash}
      api={api}
      />
  </div>
)

export default Detail
