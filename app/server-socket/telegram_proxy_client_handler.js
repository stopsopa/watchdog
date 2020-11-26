
const log = require('inspc');

const se = require('nlab/se');

const { extractRequest } = require('../lib/telegram')

const th = msg => new Error(`telegram.js error: ${msg}`);

module.exports = ({
  io,

  // WARNING:
  //     KEEP IN MIND THAT THIS IS ACTUALLY socket REPRESENTING
  //     CONNECTION WITH ANOTHER SERVER, NOT BROWSER
  socket,

  telegramMiddleware,
}) => {
  
  const forward = (req) => {

    const forwarding = extractRequest(req);

    log.dump({
      forwarding,
    })

    socket.emit('telegram_forward_webhook_traffic', forwarding);
  }

  telegramMiddleware.register(forward);

  socket.on('disconnect', () => {

    telegramMiddleware.unregister(forward);
  });
}