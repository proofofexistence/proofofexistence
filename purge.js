
import bcypher from 'blockcypher'
import {
  BLOCKCYPHER_TOKEN,
  MAGIC_NUMBER,
  BASE_PRIVATE_KEY,
  TARGET_PAYMENT_ADDRESS,
  SERVER_URL,
  networkName,
  DEBUG
} from './lib/config'


var MAX_HOOKS = 120;
var bcapi = new bcypher('btc', networkName, BLOCKCYPHER_TOKEN);
function printResponse(err, data) {
  if (err !== null) {
    console.log(err);
  } else {
    console.log(data);
  }
}

bcapi.listHooks(function(err, data) {
  if (err !== null) {
    console.log(err);
  } else {
    console.log('found',data.length, 'hooks')
    while (data.length > MAX_HOOKS) {
      var hook = data.shift();
      console.log('deleting', hook.id)
      bcapi.delHook(hook.id, printResponse)
    }
  }
});

