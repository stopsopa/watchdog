
require('dotenv-up')({
  override    : false,
  deep        : 1,
}, true, 'index.server');

(function () {

  const atomclock = require('./app/lib/atomclock');

  atomclock.crashServer(process.env.PROTECTED_MYSQL_MAX_TIME_DIFF);
}());

const path          = require('path');

const fs            = require('fs');

const express       = require('express');

const log           = require('inspc');

const delay         = require('nlab/delay');

const compression   = require('compression');

const se = require('nlab/se');

const app = express();

const server    = require('http').createServer(app);

app.set('json spaces', 4);

app.use(express.urlencoded({extended: false}));

app.use(express.json());

const env = name => {

  if ( typeof process.env[name] !== 'string' ) {

    throw new Error(`process.env.${name} doesn't exist`);
  }

  if ( ! process.env[name].trim() ) {

    throw new Error(`process.env.${name} is an empty string`);
  }

  return process.env[name];
}

app.use(compression({filter: (req, res) => {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false
  }

  // fallback to standard filter function
  return compression.filter(req, res)
}}));

const estool = (async function () {

  const estool                = require('./app/es/es');

  estool.init({
    default: {
      schema      : env('PROTECTED_ES_DEFAULT_SCHEMA'),
      host        : env('PROTECTED_ES_DEFAULT_HOST'),
      port        : parseInt(env('PROTECTED_ES_DEFAULT_PORT'), 10),
      username    : process.env.PROTECTED_ES_DEFAULT_USERNAME, // because es.js might work with servers without credentials (uprotected server)
      password    : process.env.PROTECTED_ES_DEFAULT_PASSWORD,
      prefix      : process.env.PROTECTED_ES_DEFAULT_INDEX_PREFIX,
    }
  });

  // await delay(1000);


  const ensureIndex = require('./app/es/ensureIndex');

  const es = estool();

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

(async function () {

  try {

    const knex              = require('knex-abstract');

    const mysql = require('./app/models/mysql');

    knex.init({
      def: 'mysql',
      mysql: {
        // CREATE DATABASE IF NOT EXISTS `dashboard` /*!40100 DEFAULT CHARACTER SET utf8 */
        // GRANT ALL PRIVILEGES ON dashboard.* To 'dashboard'@'%' IDENTIFIED BY 'pass';
        // SHOW GRANTS FOR 'dashboard';
        // DROP USER 'dashboard'
        client: 'mysql',
        connection: {
          host        : env('PROTECTED_MYSQL_HOST'),
          port        : env('PROTECTED_MYSQL_PORT'),
          user        : env('PROTECTED_MYSQL_USER'),
          password    : env('PROTECTED_MYSQL_PASS'),
          database    : env('PROTECTED_MYSQL_DB'),
          charset     : 'utf8',
          // charset     : 'utf8mb4_general_ci',
          multipleStatements  : true, // this flag makes possible to execute queries like this:
          // `SET @x = 0; UPDATE :table: SET :sort: = (@x:=@x+1) WHERE :pid: = :id ORDER BY :l:`
          // its mainly for nested set extension library https://github.com/stopsopa/knex-abstract/blob/master/src/lr-tree.js
        },
        pool: {
          afterCreate: function(conn, cb) {
            // https://knexjs.org#Installation-pooling-afterCreate
            // https://stackoverflow.com/a/46277941/5560682

            conn.query(`SET SESSION sql_mode=(SELECT REPLACE(@@SESSION.sql_mode,'ONLY_FULL_GROUP_BY',''))`, function (err) {
              cb(err, conn);
            });
          },
          "min": 2,
          "max": 6,

          // https://github.com/Vincit/tarn.js/blob/master/src/Pool.ts#L135
          // https://github.com/strapi/strapi/issues/2790
          "createTimeoutMillis": 3000,
          "acquireTimeoutMillis": 30000,
          "idleTimeoutMillis": 30000,
          "reapIntervalMillis": 1000,
          "createRetryIntervalMillis": 100,
          // "propagateCreateError": false // <- default is true, set to false
        },
        // issue <e> [String]: >TimeoutError: Knex: Timeout acquiring a connection. The pool is probably full. Are you missing a .transacting(trx) call?< len: 120
        // suggested solutions:
        //
        //      https://github.com/knex/knex/issues/1382#issuecomment-219423066
        //          ensure acquireConnectionTimeout is much larger than pool.requestTimeout
        //
        //      https://github.com/knex/knex/issues/2820#issuecomment-481710112
        //          trick with propagateCreateError to
        acquireConnectionTimeout: 60000, // 60000 its default value: http://knexjs.org/#Installation-acquireConnectionTimeout
        models: mysql,
      },
      // Create this database manually
      // CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8 */
      // test: {
      //     // CREATE DATABASE IF NOT EXISTS `dashboard` /*!40100 DEFAULT CHARACTER SET utf8 */
      //     // GRANT ALL PRIVILEGES ON dashboard.* To 'dashboard'@'%' IDENTIFIED BY 'pass';
      //     // SHOW GRANTS FOR 'dashboard';
      //     // DROP USER 'dashboard'
      //     client: 'mysql',
      //     connection: {
      //         host        : process.env.PROTECTED_TEST_MYSQL_HOST,
      //         user        : process.env.PROTECTED_TEST_MYSQL_USER,
      //         password    : process.env.PROTECTED_TEST_MYSQL_PASS,
      //         database    : process.env.PROTECTED_TEST_MYSQL_DB,
      //     }
      // }
    });

    let es = await estool;

    es = await es();

    (function () {

      (function () {

        const cls = require('./app/probeClass');

        cls.setup({
          dir: path.resolve(__dirname, 'var', 'probes'),
          es,
        });
      }());

      const driver = require('./app/probeDriver');

      setTimeout(() => {

        driver({
          knex: knex(),
          es,
        });
      }, 1000);

      // fetch('/passive')

      // fetch('/passive/67', {
      //   method: 'post',
      //   credentials: 'omit',
      //   headers: {
      //     "Content-type": "application/json; charset=utf-8"
      //   },
      //   body: JSON.stringify({a: 'b'})
      // }).then(res => res.json()).then(data => console.log(data))

      const man = knex().model.probes;

      app.all('/passive/:id(\\d+)', async (req, res) => {

        const id = req.params.id;

        let password = req.body.password;

        if ( ! password ) {

          password = req.query.password;
        }

        if ( ! password ) {

          password = req.headers['x-password'];
        }

        if ( ! password ) {

          password = '';
        }

        const probe = await man.queryOne(`select * from :table: where id = :id and type = 'passive'`, {
          id,
        });

        return res.json({
          password,
          params: req.params,
          headers: req.headers,
          json: req.body,
          probe,
        });
      });

    }());

    await knex().model.common.howMuchDbIsFasterThanNode(true); // crush if greater than 5 sec
  }
  catch (e) {

    log.dump({
      general_error_knex_block: se(e),
    }, 4)

    process.exit(1);
  }

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

const web = path.resolve(__dirname, 'public');

// app.all('/basic', (req, res) => {
//
//   res.json({
//     Authorization: req.headers.authorization
//   })
// });

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
  index: path.resolve(web, 'index.html'),
}));

app.get('*', (req, res) => res.sendFile(path.resolve(web, 'index.html')));

let port = parseInt(env('NODE_PORT'), 10);

if ( port < 1 ) {

  throw new Error(`port < 1`);
}

const host = env('NODE_HOST');

// for sockets
server.listen( // ... we have to listen on server
  port,
  host,
  undefined, // io -- this extra parameter
  () => {
    console.log(`\n 🌎  Server is running ` + ` ${host}:${port} ` + "\n")
  }
);

(function () {

  const io        = require('socket.io')(server); // io

// https://stackoverflow.com/a/37159364/5560682
  io.use(require('./app/lib/socketio-wildcard')());

  require('./app/io').bind({
    io,
    bind: require('./app/socket'),
  });

}());
