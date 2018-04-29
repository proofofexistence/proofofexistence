import React from 'react'
import UploadForm from './UploadForm.jsx'

const HashProgress = ({hashingProgress}) => (
  <div id='hash-progress' className='progress'>
    <div
      className='progress-bar progress-bar-success'
      role='progressbar'
      aria-valuenow='70'
      aria-valuemin='0'
      aria-valuemax='100'
      style={{minWidth: `${hashingProgress}%`}}
      >
      {hashingProgress}%
    </div>
  </div>
)

const Finished = ({hash}) => (
  <span class='card-category'>
    {hash}
    <br />
    <small>
      <a id='digest-link' href='#'>
        Click here if you're not redirected.
      </a>
    </small>
  </span>
)

const UploadFile = ({
  logo,
  brand,
  slogan,
  tagline,
  files,
  maxFileSize,
  handleToggleSearch,
  handleAddFile,
  hashingProgress,
  hash
}) => (
  <div id='dropbox'>
    <div class='card-body'>
      <UploadForm
        files={files}
        handleAddFile={handleAddFile}
        maxFileSize={maxFileSize}
         />

      <div class='row'>
        <div class='col-lg-12'>
          <div id='explain' />
          {
              hashingProgress && hashingProgress < 100
                ? <HashProgress
                  hashingProgress={hashingProgress}
                  />
              : null
            }
          {
              hashingProgress === 100
                ? <p class='text-center'>
                  <Finished
                    hash={hash}
                    />
                </p>
              : null
            }
        </div>
      </div>
    </div>

    <div class='card-footer'>
      <p className='card-category'>
        If it has been certified already, you will be redirected to the original record.
      </p>
      <p class='card-category'>
        You can also <a
          href='#'
          class='handleToggleSearch'
          onClick={handleToggleSearch}
        >
          input a hash
        </a> to find previous records.
      </p>
    </div>
  </div>
)

export default UploadFile
