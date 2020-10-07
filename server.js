
require('dotenv-up')({
  override    : false,
  deep        : 1,
}, true, 'index.server');

const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const log           = require('inspc');

const delay         = require('nlab/delay');

const compression   = require('compression');

const {serializeError, deserializeError} = require('serialize-error');

const app = express();

app.set('json spaces', 4);

app.use(express.urlencoded({extended: false}));

app.use(express.json());

app.use(compression({filter: (req, res) => {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}}));

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

const web = path.resolve(__dirname, 'public');

app.all('/basic', (req, res) => {

  res.json({
    Authorization: req.headers.authorization
  })
});

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
  }
}));

const env = name => {

  if ( typeof process.env[name] !== 'string' ) {

    throw new Error(`process.env.${name} doesn't exist`);
  }

  if ( ! process.env[name].trim() ) {

    throw new Error(`process.env.${name} is an empty string`);
  }

  return process.env[name];
}

let port = parseInt(env('NODE_PORT'), 10);

if ( port < 1 ) {

  throw new Error(`port < 1`);
}

const host = env('NODE_HOST');

const estool = (async function () {

  const estool                = require('./es/es');

  estool.init({
    default: {
      schema      : env('PROTECTED_ES_DEFAULT_SCHEMA'),
      host        : env('PROTECTED_ES_DEFAULT_HOST'),
      port        : parseInt(env('PROTECTED_ES_DEFAULT_PORT'), 10),
      username    : process.env.PROTECTED_ES_DEFAULT_USERNAME, // because es.js might work with servers without credentials (uprotected server)
      password    : process.env.PROTECTED_ES_DEFAULT_PASSWORD,
    }
  });

  await delay(1000);

  const ensureIndex = require('./es/ensureIndex');

  const es = estool('default', true);

  if (process.argv.includes('--delete')) {

    await ensureIndex.delete();
  }
  else {

    await ensureIndex();
  }

  const data = await es(`/_cat/indices?v`);

  console.log(data)

  return estool;

}());

app.all('/geo', async (req, res) => {

  try {

    return res.json({
      test: true,
      // data,
    })
  }
  catch (e) {

    log.dump({
      'server.js error': serializeError(e)
    });

    return res.status(500).json({
      e: e.message,
    });
  }
});

app.listen(port, host, () => {

  console.log(`Running ${host}:${port}\n`);
});






