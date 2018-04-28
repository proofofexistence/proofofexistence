import React from 'react'
import UploadForm from './UploadForm.jsx';

const HashProgress = () => (
  <div id="hash-progress" class="progress">
    <div
      class="progress-bar progress-bar-success"
      role="progressbar"
      aria-valuenow="60"
      aria-valuemin="0"
      aria-valuemax="100"
      >
    </div>
  </div>
)

const DigestLink = () => (
  <small>
    <a id="digest-link" href="#">
      Click here if you're not redirected.
    </a>
  </small>
)

const UploadFile = ({
  logo,
  brand,
  slogan,
  tagline,
  handleToggleSearch
}) => (
  <div id="dropbox" class="card">
    <div class="card-header">
      <h3 class="card-title">

      </h3>
      <p class="card-category">
        Drag and drop your document here, or choose a file.
        The file will <strong>not</strong> be uploaded.
      </p>
    </div>
    <div class="card-body">

       <UploadForm />

      <div class="row">
        <div class="col-lg-12">
          <div id="explain"></div>
            <HashProgress />
          <p class="text-center">
              <DigestLink />
          </p>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <p class="card-category">
        or <a
        href="#"
        class="handleToggleSearch"
        onClick={handleToggleSearch}
        >
          input a hash
        </a> to find previous records.
      </p>
    </div>
  </div>
)


export default UploadFile
