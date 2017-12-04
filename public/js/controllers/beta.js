'use strict';

$(document).ready(function() {

  var digest = $('#digest');
  var timestamp = $('#timestamp');
  var blockchain_message = $('#blockchain_message');
  var icon = $('#icon');

  var errorSigning = $('#errorSigning');
  var certify_message = $('#certify_message');
  var confirmed_message = $('#confirmed_message');
  var confirming_message = $('#confirming_message');
  var signatures = $('#signatures');
  var signatureList = $('#signatureList');

  var tx = $('.tx');
  var plink = $('#payment_link');
  var qrcode;

  var pathname = window.location.pathname.split('/');
  var uuid = pathname[pathname.length - 1];

  var showErrorSigning = false;
  var hasSignatures = false;
  var hideSignatures = false;
  var signing = false;

  $('#urlLink').attr('href', window.location.toString());
  $('#urlLink').text(window.location.toString());

  $('#end_notarize').click(function(ev) {
    ev.preventDefault();
    hideSignatures = true;
    certify_message.show();
    if (!hasSignatures) {
      signatures.hide();
    }
    $('#add_signature').hide();
    $('#signatures').hide();
    if (hasSignatures) {
      $('#confirmed_signatures').show()
    }
  })
  $('#add_signature').click(function(ev) {
    ev.preventDefault();
    signing = true;
    $('#privateKeyContainer').show();
    $('#buttonsSignature').hide();
    $('#signatureList').hide();
    $('#explainSignatures').hide();
  })
  $('#okSignature').click(function(ev) {
    ev.preventDefault()
    showErrorSigning = false;
    sign(uuid, function() {
      signing = false;
      $('#buttonsSignature').show();
      $('#privateKeyContainer').hide();
      $('#explainSignatures').show();
      if (hasSignatures) {
        signatureList.show()
      }
    });
  })
  $('#cancelSignature').click(function(ev) {
    ev.preventDefault()
    signing = false;
    $('#buttonsSignature').show();
    $('#privateKeyContainer').hide();
    $('#explainSignatures').show();
    showErrorSigning = false;
    if (hasSignatures) {
      signatureList.show()
    }
  })

  var postData = {
    'd': uuid
  };

  var onFail = function() {
    digest.html(translate('Error!'));
    timestamp.html(translate('We couldn\'t find that document'));
    //window.location = 'http://old.proofofexistence.com/detail/' + uuid;
  };

  var onSuccess = function(data) {
    if (showErrorSigning) {
      errorSigning.show();
    } else {
      errorSigning.hide();
    }

    if (data.success == true) {
      confirming_message.hide();
      blockchain_message.show();
      digest.html(data.digest);
      var times = '';
      if (data.timestamp) {
        times += translate('Registered in our servers since:') +
          ' <strong>' + data.timestamp + '</strong><br />';
      }
      if (data.txstamp) {
        times += translate('Transaction broadcast timestamp:') +
          ' <strong>' + data.txstamp + '</strong><br />';
      }
      if (data.blockstamp) {
        times += translate('Registered in the bitcoin blockchain since:') +
          ' <strong>' + data.blockstamp + '</strong><br />'
      }
      times += '<br />'
      timestamp.html(times);
      var msg = '';
      var clz = '';
      var has_tx = data.tx && data.tx.length > 1;
      var has_blockstamp = data.blockstamp && data.blockstamp.length > 1;
      var is_unconfirmed = !data.pending && has_tx;
      var is_confirmed = !data.pending && has_tx && has_blockstamp;
      var img_src = '';
      var txURL = 'https://live.blockcypher.com/' +
        (data.network === 'testnet' ? 'btc-testnet' : 'btc') + '/tx/' +
        data.tx;
      if (is_confirmed) {
        console.log('in blockchain');
        msg = translate('Document proof embedded in the Bitcoin blockchain!');
        clz = 'alert-success';
        img_src = 'check.png';
        tx.html('<a href="' + txURL + '"> ' + translate('Transaction') + ' ' + data.tx + '</a>');

        if (data.signatures && data.signatures.length) {
          var confirmedList = $('#confirmed_signatures');
          hasSignatures = true;
          confirmedList.show();
          displaySignatures(confirmedList.find('ul'), data.signatures);
          $('#sighashinfo').show();
          $('#sighashinfo').find('textarea').val(data.rawSignatures);
          $('#sighash').text(data.sighash);
        }

        confirmed_message.show();
        signatures.hide();
        confirming_message.hide();
        certify_message.hide();
      } else if (is_unconfirmed) {
        console.log('payment processing');
        msg = translate('Payment being processed. Please wait while ' +
          'the bitcoin transaction is confirmed by the network.');
        clz = 'alert-warn';
        img_src = 'wait.png';

        if (data.signatures && data.signatures.length) {
          hasSignatures = true;
          var confirmedList = $('#confirmed_signatures');
          confirmedList.show();
          displaySignatures(confirmedList.find('ul'), data.signatures);
        }
        tx.html('<a href="' + txURL + '"> ' + translate('Transaction') + ' ' + data.tx + '</a>');
        confirmed_message.hide();
        signatures.hide();
        confirming_message.show();
        certify_message.hide();
        setTimeout(askDetails, 5000);
      } else {
        console.log('registered');
        msg = translate('Document proof not yet embedded in the bitcoin blockchain.');
        clz = 'alert-danger';
        img_src = 'warn.png';

        var uri = 'bitcoin:' + data.payment_address + '?amount=0.02';
        if (!qrcode) {
          qrcode = new QRCode('qr', {
            text: uri,
            width: 256,
            height: 256,
            correctLevel: QRCode.CorrectLevel.H
          });
        }
        if (!signing && data.signatures && data.signatures.length) {
          hasSignatures = true;
          $('#no_signatures_message').hide();
          signatureList.show();
          displaySignatures(signatureList, data.signatures);
          displaySignatures($('#confirmed_signatures').find('ul'), data.signatures);
        }
        setTimeout(askDetails, 5000);
        plink.text(data.payment_address);
        confirmed_message.hide();
        confirming_message.hide();
        if (hideSignatures) {
          signatures.hide()
          certify_message.show();
        } else {
          signatures.show()
          certify_message.hide();
        }
      }
      blockchain_message.html(msg);
      blockchain_message.addClass(clz);
      icon.html('<img src="/img/' + img_src + '" />');
    } else {
      onFail();
    }
  };

  var askDetails = function() {
    $.post('../api/v1/get', postData, onSuccess, 'json').fail(onFail);
  };

  askDetails();

  var sign = function(hash, callback) {

    $('#okSignature').enable(false).text('Loading...');
    var privKey = $('#privateKey').val();
    $('#privateKey').val('');
    var signature;

    var nextStep = function() {
      var dig = bitcore.crypto.Hash.sha256(new bitcore.deps.Buffer(signature)).toString('hex');
    };

    var result = openpgp.key.readArmored(privKey);

    if (result.keys.length) {
      var passphrase = $('#passphrase').val();
      if (passphrase) {
        if (!result.keys[0].decrypt(passphrase)) {
          showErrorSigning = true;
          errorSigning.text('Your password doesn\'t match the private key\'s. Mind trying again?')
          errorSigning.show();
          $('#okSignature').enable(true).text('Sign');
          return;
        }
      }
      var fingerprint = result.keys[0].primaryKey.getFingerprint();

      openpgp.signClearMessage(result.keys, hash).then(function(sig) {

        signature = sig;
        $.post('/api/v2/appendSig/', {
          hash: hash,
          signature: {signature: signature, fingerprint: fingerprint}
        }).done(function(result) {
          if (!result.success) {
            showErrorSigning = true;
            errorSigning.text('We had some issues verifying your signature. Mind trying again later?');
            errorSigning.show();
            $('#okSignature').enable(true).text('Sign');
          } else {
            $('#okSignature').enable(true).text('Sign');
            callback();
          }
        });

      }).catch(function(e) {
        showErrorSigning = true
        errorSigning.text('We had some issues verifying your private key. Mind trying again later?');
        errorSigning.show();
        $('#okSignature').enable(true).text('Sign');
      })
    } else {
      showErrorSigning = true
      errorSigning.text('We couldn\'t recognize the validity of your private key. Mind trying again?');
      errorSigning.show();
      $('#okSignature').enable(true).text('Sign');
    }
  };

  var displaySignatures = function(container, signatures) {
    var append = function(fingerprint) {
      if (!container.find('.data-item-' + fingerprint).length) {
        var item = $('<li class="data-item-' + fingerprint + '">Public Key: ' + fingerprint.substr(fingerprint.length - 16).replace(/(.{4})/gi, '$1 ') + '</li>');
        $.get('https://keybase.io/_/api/1.0/user/lookup.json?key_fingerprint=' + fingerprint).done(function(res) {
          if (res.them.length) {
            var username = res.them[0].basics.username;
            item.html('<a href="https://keybase.io/' + username + '">' + username + '</a> (' + fingerprint.substr(fingerprint.length - 16).replace(/(.{4})/gi, '$1 ').trim() + ')');
          }
        });
        container.append(item)
      }
    }
    for (var i = 0; i < signatures.length; i++) {
      append(signatures[i].fingerprint);
    }
  };

});
