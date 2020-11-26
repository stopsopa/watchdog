
const log = require('inspc');

const delay = require('nlab/delay');

const isObject = require('nlab/isObject');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const telegram = require('../lib/telegram')

const {
  extractRequest,
  resetWebhook,
} = telegram;

const th = msg => new Error(`telegram.js error: ${msg}`);

module.exports = ({
  io,
  socket,
}) => {

  socket.on('telegram_get_current_webhook', async () => {

    let data = {};

    try {

      // https://api.telegram.org/botxxxx:AAHxxxxxxxxxG8/getWebhookInfo
      const res = await telegram('getWebhookInfo');

      let ok = false;

      try {

        ok = res.body.ok === true && isObject(res.body.result);
      }
      catch (e) {}

      if (ok) {

        data = res.body.result;
      }
      else {

        data.error = res;
      }
    }
    catch (e) {

      data.error = e.message;
    }

    socket.emit('telegram_get_current_webhook', data);
  });

  socket.on('telegram_reset_webhook', async () => {

    try {

      resetWebhook();
    }
    catch (e) {

      log.dump({
        telegram_reset_webhook_error: se(e)
      })
    }
  });
}