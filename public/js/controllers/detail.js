'use strict';

$(document).ready(function() {

  var digest = $('#digest');
  var timestamp = $('#timestamp');
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

  var onFail = function() {
    digest.html(translate('Error!'));
    timestamp.html(translate('We couldn\'t find that document'));
  };

  var onSuccess = function(data) {
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
      } else if (is_unconfirmed) {
        console.log('payment processing');
        msg = translate('Payment being processed. Please wait while ' +
          'the bitcoin transaction is confirmed by the network.');
        clz = 'alert-warn';
        img_src = 'wait.png';
        confirmed_message.hide();
        confirming_message.show();
        certify_message.hide();
        setTimeout(askDetails, 5000);
      } else {
        console.log('registered');
        msg = translate('Document proof not yet embedded in the bitcoin blockchain.');
        clz = 'alert-danger';
        img_src = 'warn.png';
        var uri = 'bitcoin:' + data.payment_address + '?amount=' + data.payment_amount;
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
    } else {
      onFail();
    }
  };

  var askDetails = function() {
    $.post('../api/v1/get', postData, onSuccess, 'json').fail(onFail);
  };

  askDetails();

});
