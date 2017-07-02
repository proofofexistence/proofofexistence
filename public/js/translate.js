'use strict';

var disclaimer = '<strong>Important: </strong>Your browser does not support HTML5, ' +
  'so your document will need to be uploaded.' +
  ' The cryptographic digest will be calculated on our servers but the document will be' +
  ' discarded immediately, without being stored, logged, or otherwise accessed. ' +
  'Please contact us if you have any questions.';

var translate = function(msg) {
  return msg;
};

var setLanguage = function() {
  var myLang = $('.language').val();
  var expiry = new Date(60 * 24 * 60 * 60 * 1000 + Date.now());
  document.cookie = 'language=' + myLang + '; expires=' + expiry;
  window.location.reload();
};
