  {{#extend "scripts"}}
  <script type="text/javascript" src="/vendor/bitcoin-convert.min.js"></script>
  <script type="text/javascript" src="/vendor/qrcodejs/qrcode.min.js"></script>
  <script type="text/javascript" src="/js/controllers/detail.js"></script>
  {{/extend}}

  <script type="text/javascript">
   var insightTxUrl =  function(tx) {
    return '{{ insightUrl }}' + '/tx/' + tx;
   }
  </script>

<div class="container-fluid js-content">
  <div class="row">
    <div class="col-lg-12">
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-lg-12">

              <h3>
                Document information<br>
                <small id="digest" class="digest">Loading...</small>
              </h3>
      <div id="timestamp">Please wait</div>

      <form id="registration" style="display: none">
        <hr/>
        <div class="form-group">
          <label>Document hash</label>
          <input id="digestInput" class="form-control border-input" disabled="" value="" type="text">
        </div>
        <button id="digestSubmit" type="submit" class="btn btn-info btn-fill btn-wd">Register Document</button>
      </form>

      <div class='jumbotron' id='certify_message' style="display: none;">
        <h3>Want this document certified by a decentralized proof of
    existence?</h3>
        <p>We can embed the document's digest in the blockchain for you!</p>
        <p>
          You'll need to pay <strong>{{ documentPriceMbtc }} mBTC</strong> to do so, to cover our costs. Please pay to the following address:
        </p>

        <hr />
        <div class='row'>
          <div class='col-md-6' id='qr'></div>
          <div class='col-md-6' id='payment_text'>
            <p>
            Please send <strong>{{ documentPriceMbtc }} mBTC</strong> or more to:
            <strong id='payment_link'>
            </strong>
            </p>

            <p>
              After sending your payment, click the button below to continue the document certification process.
            </p>

            <form class="refresh">
              <div class="form-group">
                <button type="submit" class="refreshSubmit btn btn-info btn-lg btn-fill">Continue Certification</button>
              </div>
            </form>

          </div>
        </div>
        <hr />

      </div>
      <div class='jumbotron' id='confirming_message' style="display: none;">
        <p>
          A transaction embedding your document's digest has been broadcast to the Bitcoin network. Click the button below after the transaction is confirmed to complete the process.
          <p class="tx" class="digest"></p>

          <form class="refresh">
            <div class="form-group">
              <button type="submit" class="refreshSubmit btn btn-success btn-lg btn-fill">Complete Certification</button>
            </div>
          </form>
        </p>
      </div>
      <div class='jumbotron' id='confirmed_message' style="display: none;">
        <h3>Congratulations!</h3>
        <p>This document's digest was successfully embedded in the Bitcoin blockchain. It is now permanently certified and proven to exist since the transaction was confirmed.</p>
        <p class="tx" class="digest"></p>
        <p>If you want to verify this document in the future, just re-submit it in
          <a href="/">the homepage</a> and we'll recognize and validate it.
        </p>
      </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
