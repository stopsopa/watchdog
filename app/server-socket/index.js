
const log = require('inspc');

module.exports = (...args) => {

  require('./common')(...args);

  require('./projects')(...args);

  require('./probes')(...args);

  require('./logs')(...args);

  require('./users')(...args);

  require('./groups')(...args);

  require('./messengers')(...args);

  (function () {

    if (typeof process.env.PROTECTED_TELEGRAM_TOKEN === 'string') {

      require('./telegram_front_handler')(...args);
    }
  }());

  (function (opt = {}) {

    const {
      socket,
      telegramMiddleware = {}
    } = opt;

    if (telegramMiddleware.expressMiddlewareForward) {

      console.log(`client connected: telegramMiddleware.forward === true: forwarding`)

      let telegramproxy = false;

      try {

        telegramproxy = socket.handshake.query.telegramproxy
      }
      catch (e) {}

      if (telegramproxy) {

        console.log('telegramproxy found')

        require('./telegram_proxy_client_handler')(...args);
      }
      else {

        console.log('telegramproxy not found')
      }
    }
    else {

      console.log(`client connected: telegramMiddleware.forward === false: NOT forwarding`)
    }
  }(...args));

}