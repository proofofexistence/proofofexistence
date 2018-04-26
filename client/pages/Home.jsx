import React, { Component } from 'react';
import axios from 'axios';

class Home extends Component {
  render() {
    return (
      <div class="index-page container-fluid js-content">
        <div class="row" id="upload">
            <div class="no-border card col-lg-6">
              <h3 class="card-title">
                Select a document and have it certified in the Bitcoin blockchain
                <br>
                <small>
                  <span>
                    If it has been certified already, you will be redirected to the original record.
                  </span>
                  <br>
                  <a href="" data-toggle="modal" data-target="#helpModal">
                    Learn more.
                  </a>
                </small>
              </h3>
            </div>

            <UploadFile />

          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Ongoing Submissions</h3>
                <p class="card-category">Documents already registered for certification, waiting for payments.</p>
                </div>
                <List documents={registered}/>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Certifications</h3>
                <p class="card-category">Documents of proven existence, confirmed in the blockchain</p>
              </div>
              <List documents={confirmed}/>
            </div>
          </div>
        </div>
      </div>
  )
}
