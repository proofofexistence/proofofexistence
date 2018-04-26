<div id="dropbox" class="card col-lg-4 ml-auto ">
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
        <div id="hash-progress" class="progress" style="display: none">
          <div class="progress-bar progress-bar-success" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">
          </div>
        </div>
        <p class="text-center">
          <small>
          <a id="digest-link" href="#" style="display: none">
            Click here if you're not redirected.
          </a>
          </small>
        </p>
      </div>
    </div>
  </div>
  <div class="card-footer">
    <p class="card-category">
      or <a href="#" class="toggleHashSearch">input a hash</a> to find previous records.
    </p>
  </div>
</div>
