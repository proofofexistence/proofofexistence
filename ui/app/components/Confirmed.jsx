import React from 'react'

const Confirmed = ({
  tx
}) => (
  <div class='jumbotron' id='confirmed_message' style="display: none;">
    <h3>Congratulations!</h3>
    <p>This document's digest was successfully embedded in the Bitcoin blockchain. It is now permanently certified and proven to exist since the transaction was confirmed.</p>
    <p class="tx" class="digest"></p>
    <p>If you want to verify this document in the future, just re-submit it in
      <a href="/">the homepage</a> and we'll recognize and validate it.
    </p>
  </div>
)
