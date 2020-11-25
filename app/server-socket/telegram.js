
const log = require('inspc');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const th = msg => new Error(`telegram.js error: ${msg}`);

module.exports = ({
  io,
  socket,
  telegramMiddleware,
}) => {
  
  const forward = (req) => {

    const forwarding = {
      url       : req.url,
      method    : req.method,
      body      : req.body,
      query     : req.query,
      headers   : req.headers,
    };

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