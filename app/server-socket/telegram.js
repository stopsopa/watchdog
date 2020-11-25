
const log = require('inspc');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const { extractRequest } = require('../lib/telegram')

const th = msg => new Error(`telegram.js error: ${msg}`);

module.exports = ({
  io,
  socket,
  telegramMiddleware,
}) => {
  
  const forward = (req) => {

    const forwarding = extractRequest(req);

    log.dump({
      forwarding,
    })

    socket.emit('telegram-forward-webhook-traffic', forwarding);
  }

  telegramMiddleware.register(forward);

  socket.on('disconnect', () => {

    telegramMiddleware.unregister(forward);
  });
}