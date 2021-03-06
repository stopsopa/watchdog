
const log           = require('inspc');

const dotenv        = require('./app/lib/dotenv');

require('dotenv-up')({
  override    : false,
  deep        : 1,
}, true, 'index.server');

dotenv('PROTOCOL');

dotenv('HOST');

dotenv('PORT');

(function () {

  dotenv('MIN_INTERVAL_MILLISECONDS');

  if (typeof process.env.MIN_INTERVAL_MILLISECONDS !== 'string') {

    throw new Error(`process.env.MIN_INTERVAL_MILLISECONDS is not a string`);
  }

  let reg = /^[\d\(\)+\*-\.\/\s]+$/;

  if ( ! reg.test(process.env.MIN_INTERVAL_MILLISECONDS) ) {

    throw new Error(`process.env.MIN_INTERVAL_MILLISECONDS don't match: '${reg}' and it's value is '${process.env.MIN_INTERVAL_MILLISECONDS}'`);
  }

  process.env.MIN_INTERVAL_MILLISECONDS = eval('(' + process.env.MIN_INTERVAL_MILLISECONDS + ')');

  reg = /^\d+$/;

  if ( ! reg.test(process.env.MIN_INTERVAL_MILLISECONDS) ) {

    throw new Error(`process.env.MIN_INTERVAL_MILLISECONDS don't match: '${reg}' and it's value is '${process.env.MIN_INTERVAL_MILLISECONDS}'`);
  }
}());

if (process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY === 'telegramproxyserver') { // prod .env.kub.xxx driven

  process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY = "telegramproxyserver" // http://... || telegramproxyserver
}

if (process.argv.includes('--telegram-test-forward-server')) { // localhost test mode .env driven

  process.env.NODE_PORT = dotenv('CONDITIONAL_TELEGRAM_PROXY_LOCAL_PORT');

  process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY = "telegramproxyserver" // http://... || telegramproxyserver
}

// log.dump({
//   'process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY': process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY,
//   'process.env.NODE_PORT': process.env.NODE_PORT,
//   'process.env.PROTOCOL': process.env.PROTOCOL,
//   'process.env.PORT': process.env.PORT,
//   'process.env.HOST': process.env.HOST,
// })
//
// process.exit(0);

(function () {

  const atomclock = require('./app/lib/atomclock');

  atomclock.crashServer(process.env.PROTECTED_MYSQL_MAX_TIME_DIFF);
}());

const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const delay         = require('nlab/delay');

const ms        = require('nlab/ms');

const compression   = require('compression');

const se = require('nlab/se');

const webpack = require('./config')('production');

const app = express();

const server    = require('http').createServer(app);

app.set('json spaces', 4);

app.use(express.urlencoded({extended: false}));

app.use(express.json());

app.all('/favicon.ico', (req, res) => {
  res.status(404).end();
})

const requestIp = require('request-ip');

app.use(requestIp.mw());

// curl -XPOST -d '{"foo": "bar"}' -H 'content-type: application/json' http://localhost:1046/test?a=b&test=getval
// var k = {
//   "ip": "127.0.0.1",
//   "query": {
//     "a": "b"
//   },
//   "body": {
//     "foo": "bar"
//   },
//   "method": "POST",
//   "headers": {
//     "host": "localhost:1046",
//     "user-agent": "curl/7.64.1",
//     "accept": "*/*",
//     "content-type": "application/json",
//     "content-length": "14"
//   },
//   "original": {
//     "raw": "/test?a=b",
//     "protocol": "http:",
//     "hostname": "localhost",
//     "port": 1046,
//     "pathname": "/test",
//     "search": "?a=b",
//     "full": "http://localhost:1046/test?a=b"
//   }
// }

// const originalUrl = require('original-url'); // yarn add original-url
//
// app.all('/test', async (req, res) => {
//
//   const original = originalUrl(req);
//
//   return res.json({
//     // url: req.
//     ip: req.clientIp,
//     query: req.query,
//     body: req.body,
//     method: req.method,
//     headers: req.headers,
//     original,
//   })
// });

app.use(compression({filter: (req, res) => {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}}));

const web = path.resolve(__dirname, 'public');

app.use(express.static(web, { // http://expressjs.com/en/resources/middleware/serve-static.html
  // maxAge: 60 * 60 * 24 * 1000 // in milliseconds
  maxAge: '356 days', // in milliseconds max-age=30758400
  setHeaders: (res, path) => {

    if (/\.bmp$/i.test(path)) { // for some reason by default express.static sets here Content-Type: image/x-ms-bmp

      res.setHeader('Content-type', 'image/bmp')
    }

    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
    // res.setHeader('Cache-Control', 'public, no-cache, max-age=30758400')
    // res.setHeader('Cache-Control', 'public, only-if-cached')
  },
  // index: path.resolve(web, 'index.html'),
  index: false, // https://expressjs.com/en/4x/api.html#express.static
}));

const estool = (async function () {

  const estool                = require('./app/es/es');

  estool.init({
    default: {
      schema      : dotenv('PROTECTED_ES_DEFAULT_SCHEMA'),
      host        : dotenv('PROTECTED_ES_DEFAULT_HOST'),
      port        : parseInt(dotenv('PROTECTED_ES_DEFAULT_PORT'), 10),
      username    : process.env.PROTECTED_ES_DEFAULT_USERNAME, // because es.js might work with servers without credentials (uprotected server)
      password    : process.env.PROTECTED_ES_DEFAULT_PASSWORD,
      prefix      : process.env.PROTECTED_ES_DEFAULT_INDEX_PREFIX,
    }
  });

  // await delay(1000);

  const ensureIndex = require('./app/es/ensureIndex');

  const es = estool();

  const i = process.argv.indexOf(`--delete`);

  if (i > -1) {

    await ensureIndex.delete(process.argv[i + 1]);
  }
  else {

    await ensureIndex();
  }

  const data = await es(`/_cat/indices?v`);

  console.log(data)

  return estool;

}());

(async function () {

  try {

    const knex              = require('knex-abstract');

    const config = require('./app/models/config')

    knex.init(config);

    await knex().model.common.howMuchDbIsFasterThanNode(true); // crush if greater than 5 sec

    let es = await estool;

    es = await es();

    await (async function () {

      const io        = require('socket.io')(server); // io

      if (typeof process.env.PROTECTED_TELEGRAM_TOKEN === 'string') {

        const telegram = require('./app/lib/telegram');

        telegram.config({
          token: process.env.PROTECTED_TELEGRAM_TOKEN,
          io,
        });
      }

      (function () {

// https://stackoverflow.com/a/37159364/5560682
        io.use(require('./app/lib/socketio-wildcard')());

        require('./app/io').bind({
          io,
          bind: require('./app/server-socket'),
          app,
        });
      }());

      await (async function () {

        try {

          const driver = require('./app/probeDriver');

          await driver({
            dir: path.resolve(__dirname),
            knex: knex(),
            es,
            io,
          });

          // fetch('/passive')

          // fetch('/passive/67', {
          //   method: 'post',
          //   credentials: 'omit',
          //   headers: {
          //     "Content-type": "application/json; charset=utf-8"
          //   },
          //   body: JSON.stringify({a: 'b'})
          // }).then(res => res.json()).then(data => console.log(data))

          app.all('/passive/:id(\\d+)', async (req, res) => {

            const id = req.params.id;

            try {

              const probe = driver.getProbe(id);

              await probe.passiveEndpoint(req);

              return res.send("logged").end();
            }
            catch (e) {

              log.dump({
                passive_probe_endpoint_error: se(e)
              });

              return res.status(500).json({
                error: String(e),
              });
            }
          });
        }
        catch (e) {

          log.dump({
            probeDriver_contructor_general_error: se(e)
          });

          process.exit(1);
        }
      }())

      await (async function () {

        try {

          const driver = require('./app/boxDriver');

          await driver({
            app,
            knex: knex(),
            es,
            io,
          });

          // fetch('/messenger')

          // await fetch('/messenger/test?password=testtest&test=100').then(p => p.json())

          // https://stopsopa.github.io/pages/bash/index.html?admin:password#basic-auth-generator
          // WARNING: USE PROTECTED_ES_DEFAULT_USERNAME & PROTECTED_ES_DEFAULT_PASSWORD FROM .env

          // fetch('/messenger/aaac?password=abc', {
          //   method: 'post',
          //   credentials: 'omit',
          //   headers: {
          //     "Content-type": "application/json; charset=utf-8"
          //   },
          //   body: JSON.stringify({a: 'b'})
          // }).then(res => res.json()).then(data => console.log(data))

          // curl -XPOST -H "authorization: Basic xxxxxx" -H 'Content-Type: application/json' 'elastic.xxxx.com/watchdog_messengers/_search?format=yaml' -d '
          // {
          //   "query": { "term" : {"messenger_id" : 1} },
          //   "sort": { "created": { "order": "desc" } },
          //   "size": 1
          // }'

          app.all(`/messenger/:name`, async (req, res) => {

            const name = req.params.name;

            try {

              const messenger = driver.getBoxByName(name);

              const data = await messenger.messageEndpointCheckPassword(req);

              return res.json(data);
            }
            catch (e) {

              log.dump({
                messenger_endpoint_error: se(e)
              });

              return res.status(500).json({
                error: String(e),
              });
            }
          });
        }
        catch (e) {

          log.dump({
            boxDriver_contructor_general_error: se(e)
          });

          process.exit(1);
        }
      }());
    }());

// see more: https://github.com/stopsopa/nlab/blob/master/src/express/extend-res.js
    (function () {

      const user = process.env.PROTECTED_BASIC_AUTH_USER;

      const pass = process.env.PROTECTED_BASIC_AUTH_PASSWORD;

      if ( typeof user === 'string' && typeof pass === 'string' && user.trim() && pass.trim() ) {

        var auth = require('basic-auth');

        app.use((req, res, next) => {

          var credentials = auth(req);

          if ( ! credentials || credentials.name !== user || credentials.pass !== pass) {

            res.statusCode = 401;

            res.setHeader('WWW-Authenticate', 'Basic realm="example"')

            res.end('Access denied')

          } else {

            next();
          }
        });
      }
      else {

        console.log('PROTECTED_BASIC_AUTH_USER or PROTECTED_BASIC_AUTH_PASSWORD or both are not defined - basic auth disabled')
      }
    }());

// app.all('/basic', (req, res) => {
//
//   res.json({
//     Authorization: req.headers.authorization
//   })
// });

    (function () {

      const ifDevUseFileModificationTime = (function () {

        if (process.env.NODE_ENV !== "production") {

          try {

            const w           = eval('require')('./webpack.config');

            return path.resolve(w.output.path, w.output.filename.replace(/\[name\]/g, Object.keys(w.entry)[0]));
          }
          catch (e) {

            log.dump({
              ifDevUseFileModificationTime_error: e,
            })
          }
        }
      }());

      const template = require('./app/lib/server-template')({
        buildtimefile   : webpack.server.buildtime,
        tempatefile     : path.resolve(web, 'index.html'),
        isProd          : process.env.NODE_ENV === "production",
      })

      app.get('*', (req, res) => {

        let mtime;

        if (ifDevUseFileModificationTime) {

          try {

            if (fs.existsSync(ifDevUseFileModificationTime)) {

              const stats = fs.statSync(ifDevUseFileModificationTime);

              mtime = (stats.mtime).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-') + '_dev_mtime'
            }
          }
          catch (e) {}
        }

        let tmp = template({
          mode            : process.env.NODE_ENV || 'undefined',
          mtime,
        });

        res.send(tmp);
      });
    }());

    let port = parseInt(dotenv('NODE_PORT'), 10);

    if ( port < 1 ) {

      throw new Error(`port < 1`);
    }

    const host = dotenv('NODE_HOST');

// for sockets
    server.listen( // ... we have to listen on server
      port,
      host,
      undefined, // io -- this extra parameter
      () => {
        console.log(`\n 🌎  Server is running ` + ` ${host}:${port} ` + "\n")
      }
    );

  }
  catch (e) {

    log.dump({
      general_error_knex_block: se(e),
    }, 4)

    process.exit(1);
  }

}());