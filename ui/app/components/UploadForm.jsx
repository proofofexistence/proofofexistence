import React from 'react'

const UploadForm = ({ }) => (
  <form id="upload_form">
    <fieldset>
      <label class="custom-file">
        <input id="file" class="custom-file-input" type="file" />
        <span class="custom-file-control"></span>
      </label>
    </fieldset>
  </form>
)

export default UploadForm
