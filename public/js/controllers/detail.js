'use strict';

$(document).ready(function() {

  var digest = $('#digest');
  var timestamp = $('#timestamp');
  var registration = $('#registration');
  var digestInput = $('#digestInput');
  var digestSubmit = $('#digestSubmit');
  var refresh = $('#refresh');
  var refreshSubmit = $('#refreshSubmit');
  var blockchain_message = $('#blockchain_message');
  var icon = $('#icon');
  var certify_message = $('#certify_message');
  var confirmed_message = $('#confirmed_message');
  var confirming_message = $('#confirming_message');
  var tx = $('.tx');
  var plink = $('#payment_link');
  var qrcode;

  var pathname = window.location.pathname.split('/');
  var uuid = pathname[pathname.length - 1];

  var postData = {
    'd': uuid
  };

  var onFail = function(xhr, status, error) {
    var errorMessage;

    if (xhr.status == 404) {
      errorMessage = 'We couldn\'t find that document';
      showRegistration();
    } else if (xhr.status == 400) {
      errorMessage = 'The document is not a valid hash';
    }

    digest.html(error);
    timestamp.html(errorMessage);
  };

  var onSuccess = function(data, status, xhr) {
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
      if (data.signature) {
        times += '<h4>Signature info:</h4>' + data.signature.replace(/\n/gi, '<br/>')
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
      var payment_amount = 0;
      var txURL = 'https://live.blockcypher.com/' +
        (data.network === 'testnet' ? 'btc-testnet' : 'btc') + '/tx/' +
        data.tx;
      if (is_confirmed) {
        console.log('in blockchain');
        msg = translate('Document proof embedded in the Bitcoin blockchain!');
        clz = 'alert-success';
        img_src = 'check.png';
        tx.html('<a href="' + txURL + '"> ' + translate('Transaction') + ' ' + data.tx + '</a>');
        confirmed_message.show();
        confirming_message.hide();
        certify_message.hide();
        refreshSubmit.hide();
      } else if (is_unconfirmed) {
        console.log('payment processing');
        msg = translate('Payment being processed. Please wait while ' +
          'the bitcoin transaction is confirmed by the network.');
        clz = 'alert-warn';
        img_src = 'wait.png';
        tx.html('<a href="' + txURL + '"> ' + translate('Transaction') + ' ' + data.tx + '</a>');
        confirmed_message.hide();
        confirming_message.show();
        certify_message.hide();
        setTimeout(askDetails, 5000);
      } else {
        console.log('registered');
        msg = translate('Document proof not yet embedded in the bitcoin blockchain.');
        clz = 'alert-danger';
        img_src = 'warn.png';
        payment_amount = btcConvert(data.price, 'Satoshi', 'BTC')
        var uri = 'bitcoin:' + data.payment_address + '?amount=' + payment_amount;
        if (!qrcode) {
          qrcode = new QRCode('qr', {
            text: uri,
            width: 256,
            height: 256,
            correctLevel: QRCode.CorrectLevel.H
          });
        }
        setTimeout(askDetails, 5000);
        plink.text(data.payment_address);
        confirmed_message.hide();
        confirming_message.hide();
        certify_message.show();
      }
      blockchain_message.html(msg);
      blockchain_message.addClass(clz);

      icon.html('<img src="/img/' + img_src + '" />');
    }
  };

  var showRegistration = function() {
    registration.show();
    digestInput.val(uuid);
  }

  registration.submit(function(event) {
    digestSubmit.attr('disabled', 'disabled')
    $.post('../api/v1/register/', postData, function (data) {
      registration.hide();
      askDetails();
    });
    event.preventDefault();
  });

  refresh.submit(function(event) {
    refreshSubmit.attr('disabled', 'disabled');
    $.post('../api/v1/status/', postData, function (data) {
      refreshSubmit.removeAttr('disabled')
      askDetails();
    });
    event.preventDefault();
  });

  var askDetails = function() {
    $.get('../api/v1/status/'+ uuid, onSuccess, 'json').fail(onFail);
  };

  askDetails();

});
