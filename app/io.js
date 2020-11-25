
const log               = require('inspc');

const { wait }          = require('nlab/delay');

const trim              = require('nlab/trim');

const se                = require('nlab/se');

const dotenv            = require('./lib/dotenv');

const th                = msg => new Error(`io.js error: ${msg}`);

let io;

let list = [];

const tool = {}

function bindList(socket) {

  list.forEach(({name, fn}) => {

    socket.on(name, fn);
  })
}

tool.bind = (opt = {}) => {

  ({io} = opt);

  const {
    bind,
    app,
    ...rest
  } = opt;

  const telegramMiddleware = (function () {

    const { extractRequest, middleware } = require('./lib/telegram');

    let list = [];

    const mid = {
      register                  : () => {},
      unregister                : () => {},
      expressMiddlewareForward  : false,
    }

    if (typeof process.env.PROTECTED_TELEGRAM_TOKEN === 'string' && process.env.PROTECTED_TELEGRAM_TOKEN.trim() ) {

      console.log(`process.env.PROTECTED_TELEGRAM_TOKEN defined, registering express /telegram-webhook middleware for telegram webhook`)

      // PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY="testserver" # http://... || testserver

      if (typeof process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY === 'string') {

        console.log(`process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY="${process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY}" defined`)

        const reg = /(^https?:\/\/.*$|^testserver$)/;

        if ( ! reg.test(process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY) ) {

          throw th(`if process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY defined then it should match '${reg}'`);
        }

        if (process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY === 'testserver') {

          console.log(`process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY="testserver", registering /telegram-webhook for to forward traffic to dev/local instance`);

          mid.register = fn => {

            console.log(`middleware.register`)

            if (typeof fn !== 'function') {

              throw th(`register() error: fn is not a function`);
            }

            list.push(fn);
          }

          mid.unregister = fn => {

            console.log(`middleware.unregister`)

            list = list.filter(f => f !== fn);
          }

          mid.expressMiddlewareForward = true;

          app.all('/telegram-webhook', (req, res) => {

            let error = false;

            let i = 0, l = list.length;

            try {

              for ( ; i < l ; i += 1 ) {

                list[i](req);
              }
            }
            catch (e) {

              error = se(e)
            }

            return res.json({
              ok: true,
              telegramMiddleware_length: l,
              error,
              i,
              ...extractRequest(req)
            })
          });
        }
        else { // forward handler: localclient mode http://...

          console.log(`process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY="testserver", registering /telegram-webhook proxy websocket traffic receiver`);

          const URL           = require('url').URL;

          const uri           = new URL(dotenv('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY'));

          let url = `${uri.protocol}//${uri.hostname}`

          let port = uri.port;

          if (typeof process.env.CONDITIONAL_TELEGRAM_PROXY_LOCAL_PORT === 'string') {

            port = dotenv('CONDITIONAL_TELEGRAM_PROXY_LOCAL_PORT');
          }

          port = parseInt(port, 10);

          if (port) {

            const reg = /^\d+$/;

            if ( ! reg.test(port) ) {

              throw th(`port don't match ${reg}`);
            }

            if (uri.protocol  === 'https:' && port != 443) {

              url += `:${port}`;
            }

            if (uri.protocol  === 'http:' && port != 80) {

              url += `:${port}`;
            }
          }

          console.log(`connecting to remote test telegram proxy server: ${url}`);

          const io = require('socket.io-client');

          // https://stackoverflow.com/a/47188458
          var socket = io(url, {
            reconnection: true,
            query: {
              telegramproxy: 'true',
            }
          });

          socket.on('disconnect', () => {

            console.log('disconnected from telegram proxy')
          });

          socket.on('connect', function () {

            console.log('connected to telegram proxy')

            // run against public server
            // fetch('/telegram-webhook?q1=v1&g2=v2', {
            //   method: 'post',
            //   headers: {
            //     "Content-type": "application/json; charset=utf-8",
            //   },
            //   body: JSON.stringify({a: 'b', c: 'd'})
            // })
          });

          socket.on('telegram-forward-webhook-traffic', middleware);
        }
      }
      else {

        console.log(`process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY NOT defined, registering regular /telegram-webhook for prod mode, to handle traffic in place`);

        app.all('/telegram-webhook', (req, res) => {

          middleware(extractRequest(req));

          return res.json({
            ok: true,
          });
        });
      }
    }
    else {

      console.log(`process.env.PROTECTED_TELEGRAM_TOKEN NOT defined, NOT registering express /telegram-webhook middleware for telegram webhook`)
    }

    return mid;
  }());

  io.on('connection', socket => {

    // console.log('io.js connection', socket.id)

    // * possible thanks to socketio-wildcard library
    socket.on('*', function(packet) {

      const {
        data = []
      } = packet;

      let [name, ...rest] = data;

      if ( typeof name === 'string' && /^s?[ab]s?:.+/.test(name) ) {

        name = name.split(':');

        let mode = name.shift();

        name = name.join(':');

        let s = trim(mode, 's');

        // log.dump({
        //   place: '*',
        //   name,
        //   mode,
        //   s,
        //   'mode !== s': mode !== s
        // })

        if (mode !== s) {

          mode = s;

          s = true;
        }
        else {

          s = false;
        }

        if (mode === 'b') {

          return socket.broadcast.emit(name, ...rest);
        }

        if (mode === 'a') {

          return io.emit(name, ...rest);
        }
      }
    });

    bindList(socket);

    // socket.on('abc', (a, b, c, cb) => {
    //
    //   log.dump({
    //     t: 'one',
    //     a, b, c
    //   })
    //
    //   cb && cb('ack', 'b')
    //
    //   // now call in browser:
    //   // window.socket.emit('abc', 'raz', 'dwa', {trzy: 'ctery'}, (a, b) => console.log('ac: ', a, b))
    // });
    //
    // socket.on('abc', (a, b, c) => {
    //   log.dump({
    //     t: 'two',
    //     a, b, c
    //   })
    // });

    bind({
      io,
      socket,
      telegramMiddleware,
      ...rest,
    });
  });
};

tool.on = (name, fn) => {

  if ( ! io ) {

    throw th(`io.js->on() method error, first call bind() method`);
  }

  if ( typeof name !== 'string' ) {

    throw th(`io.js->on() method error, typeof name !== 'string'`);
  }

  if ( ! name.trim() ) {

    throw th(`io.js->on() method error, name is an empty`);
  }

  if ( typeof fn !== 'function' ) {

    throw th(`io.js->on() method error, fn is not a function for given name event '${name}'`);
  }

  var sockets = io.sockets.sockets;

  for(var id in sockets)
  {
    var socket = sockets[id]; //loop through and do whatever with each connected socket

    socket.on(name, fn);
  }
}

tool.off = (name, fn) => {

  if ( ! io ) {

    throw th(`io.js->off() method error, first call bind() method`);
  }

  if ( typeof name !== 'string' ) {

    throw th(`io.js->on() method error, typeof name !== 'string'`);
  }

  if ( ! name.trim() ) {

    throw th(`io.js->on() method error, name is an empty`);
  }

  var sockets = io.sockets.sockets;

  if (typeof fn === 'function') {

    for(let id in sockets) {

      sockets[id].off(name, fn);
    }

    list = list.filter(b => ! (b.name === name && b.fn === fn));
  }
  else {

    for(let id in sockets) {

      sockets[id].removeAllListeners(name);
    }

    list = list.filter(b => {

      return b.name !== name;
    });
  }
}

module.exports = tool;


