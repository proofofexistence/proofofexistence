'use strict';

var translate = function(x) {
  return x;
};
var show_message = function(message, type) {
  if (!type) {
    type = 'success';
  }
  $.notify({
    message: message
  }, {
    type: type,
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    }
  });
};

$(document).ready(function() {
  var message = {
    'format': translate('Must select a file to upload'),
    'existing': translate('File already exists in the system. Redirecting...'),
    'added': translate('File successfully added to system. Redirecting...')
  };

  var bar = $('.progress-bar');
  var upload_submit = $('#upload_submit');
  var upload_form = $('#upload_form');
  var hashForm = $('#hash-form');
  var hashInput = $('#hash-input');
  var hashSubmit = $('#hash-submit');
  var latest = $('#latest');
  var latest_confirmed = $('#latest_confirmed');
  var explain = $('#explain');
  var hashProgress = $('#hash-progress');
  var dropbox = $('#dropbox');
  var digestLink = $('#digest-link');

  // uncomment this to try non-HTML support:
  //window.File = window.FileReader = window.FileList = window.Blob = null;

  var html5 = window.File && window.FileReader && window.FileList && window.Blob;
  $('#wait').hide();

  var handleFileSelect = function(f) {
    if (!html5) {
      return;
    }
    hashProgress.show();
    digestLink.hide();
    explain.html(translate('Loading document...'));
    var output = '';
    output = translate('Preparing to hash ') + escape(f.name) + ' (' + (f.type || translate('n/a')) + ') - ' + f.size + translate(' bytes, last modified: ') + (f.lastModifiedDate ? f.lastModifiedDate
      .toLocaleDateString() : translate('n/a')) + '';

    var reader = new FileReader();
    reader.onload = function(e) {
      var data = e.target.result;
      bar.width(0 + '%');
      bar.addClass('progress-bar-success');
      explain.html(translate('Now hashing... ') + translate('Initializing'));
      setTimeout(function() {
        CryptoJS.SHA256(data, crypto_callback, crypto_finish);
      }, 200);

    };
    reader.onprogress = function(evt) {
      if (evt.lengthComputable) {
        var w = (((evt.loaded / evt.total) * 100).toFixed(2));
        bar.width(w + '%');
      }
    };
    reader.readAsBinaryString(f);
    show_message(output, 'info');
  };
  if (!html5) {
    explain.html(translate('disclaimer'));
    upload_form.show();
  } else {
    dropbox.filedrop({
      callback: handleFileSelect
    });
  }

  // latest documents
  var refreshLatest = function(confirmed, table) {
    $.getJSON('./api/internal/latest/' + (!!confirmed ? 'confirmed' : 'unconfirmed'), function(data) {
      var items = [];

      items.push(
        '<thead><tr><th></th><th>' +
        translate('Document Digest') +
        '</th><th>' +
        translate('Timestamp') +
        '</th></tr></thead>');
      $.each(data, function(index, obj) {
        var badge = '';
        if (obj.tx) {
          badge = '<span class="label label-success">✔</span>';
        }
        var timestamp = obj.pending ? obj.timestamp : obj.blockstamp;
        var displayTime = moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
        items.push('<tr><td>' + badge + '</td><td><a href="./detail/' + obj.digest +
          '">' + obj.digest +
          '</a></td><td> ' + displayTime + '</td></tr>');
      });

      table.empty();
      table.append(items.join());
    });
  };
  refreshLatest(false, latest);
  refreshLatest(true, latest_confirmed);

  // client-side hash
  var onRegisterSuccess = function(json) {
    if (json.success) {
      show_message(vsprintf(message['added'], []), 'success');
    } else {
      show_message(message[json.reason], 'warning');
    }
    if (json.digest) {
      var link = './detail/' + json.digest;
      digestLink.prop("href", link);

      window.setTimeout(function() {
        digestLink.show();
      }, 4500);

      window.setTimeout(function() {
        dropbox.removeClass('hover');
        window.location.href = link;
      }, 5000);
    }
  };

  var onRegisterFail = function(xhr, status, error) {
    var errorMessage;

    if (xhr.status == 400) {
      errorMessage = 'The document is not a valid hash';
    } else {
      errorMessage = 'There was a problem registering the document';
    }

    show_message(error + ': ' + errorMessage, 'danger');
  }

  var crypto_callback = function(p) {
    var w = ((p * 100).toFixed(0));
    bar.width(w + '%');
    explain.html(translate('Now hashing... ') + (w) + '%');
  };

  var crypto_finish = function(hash) {
    bar.width(100 + '%');
    explain.html(translate('Document hash: ') + hash);
    var postData = { 'd': hash.toString() };
    $.post('./api/v1/register/', postData, onRegisterSuccess);
  };


  document.getElementById('file').addEventListener('change', function(evt) {
    var f = evt.target.files[0];
    handleFileSelect(f);
  }, false);

  hashForm.submit(function(event) {
    hashSubmit.prop('disabled', true);
    var postData = { 'd': hashInput.val() };
    $.post('./api/v1/register/', postData, onRegisterSuccess).fail(onRegisterFail);

    setTimeout(function() {
      hashSubmit.prop('disabled', false);
    }, 2000)

    event.preventDefault();
  });

  // upload form (for non-html5 clients)
  upload_submit.click(function() {
    upload_form.ajaxForm({
      dataType: 'json',
      beforeSubmit: function() {
        var percentVal = '0%';
        bar.removeClass('progress-bar-danger');
        bar.removeClass('progress-bar-warning');
        bar.removeClass('progress-bar-success');
        bar.addClass('progress-bar-info');
        bar.width(percentVal);
      },
      uploadProgress: function(event, position, total, percentComplete) {
        var percentVal = percentComplete + '%';
        bar.width(percentVal);
      },
      success: onRegisterSuccess
    });

  });
});
