/**
 * run all remaining migration
 *
 *    node CI/nitro/migrate.js
 *
 * revert last executed migration
 *
 *    node CI/nitro/migrate.js revert
 *
 * rollout migration to the particular migration specified by number
 *
 *    node CI/nitro/migrate.js 6
 *
 */
const fs = require('fs');

const path = require('path');

const log = require('inspc');

const trim = require('nlab/trim');

const se = require('nlab/se');

const convert = require('./convert-migration-in-ts-syntax-to-vanila-node');

const requireFromString = require('./require-from-string');

const knex              = require('knex-abstract');

const extend            = knex.extend;

const prototype         = knex.prototype;

const config = require(path.resolve(__dirname, '..', '..', 'ormconfig.js'));

const th = msg => new Error(`nitro/migrate.js error: ${msg}`);

const mysql = require('../../../app/models/mysql'); //

// https://i.imgur.com/mWzuQWP.png
const color = (function (c) {
  return (...args) => c[args.pop()] + args.join('') + c.reset;
}({
  Bright      : "\x1b[1m",
  Dim         : "\x1b[2m",
  Underscore  : "\x1b[4m",
  Blink       : "\x1b[5m",
  Reverse     : "\x1b[7m",
  Hidden      : "\x1b[8m",
  FgBlack     : "\x1b[30m",
  FgRed       : "\x1b[31m", // red
  FgGreen     : "\x1b[32m", // green
  FgYellow    : "\x1b[33m", // yellow
  FgBlue      : "\x1b[34m",
  FgMagenta   : "\x1b[35m", // magenta
  FgCyan      : "\x1b[36m", // cyan
  FgWhite     : "\x1b[37m",
  BgBlack     : "\x1b[40m",
  BgRed       : "\x1b[41m",
  BgGreen     : "\x1b[42m",
  BgYellow    : "\x1b[43m",
  BgBlue      : "\x1b[44m",
  BgMagenta   : "\x1b[45m",
  BgCyan      : "\x1b[46m",
  BgWhite     : "\x1b[47m",
  r           : "\x1b[31m", // red
  g           : "\x1b[32m", // green
  y           : "\x1b[33m", // yellow
  m           : "\x1b[35m", // magenta
  c           : "\x1b[36m", // cyan
  reset       : "\x1b[0m",
}));

const c = (...args) => process.stdout.write(color(...args));

knex.init({
  def: 'mysql',
  mysql: {
    // CREATE DATABASE IF NOT EXISTS `dashboard` /*!40100 DEFAULT CHARACTER SET utf8 */
    // GRANT ALL PRIVILEGES ON dashboard.* To 'dashboard'@'%' IDENTIFIED BY 'pass';
    // SHOW GRANTS FOR 'dashboard';
    // DROP USER 'dashboard'
    client: 'mysql',
    connection: {
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      charset: 'utf8',
      // charset     : 'utf8mb4_general_ci',
      multipleStatements: true, // this flag makes possible to execute queries like this:
      // `SET @x = 0; UPDATE :table: SET :sort: = (@x:=@x+1) WHERE :pid: = :id ORDER BY :l:`
      // its mainly for nested set extension library https://github.com/stopsopa/knex-abstract/blob/master/src/lr-tree.js
    },
    pool: {
      afterCreate: function (conn, cb) {
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
    // models: new Proxy({
    //   common: knex => extend(knex, prototype, {}),
    // }, {
    //   get(target, propKey, receiver) {
    //
    //     if (typeof target[propKey] !== 'undefined') {
    //
    //       return target[propKey];
    //     }
    //
    //     const keys = Object.keys(target);
    //
    //     throw `No such mysql manager '${propKey}', registered managers are: ` + keys.join(', ');
    //   },
    // }),
  }
});

(async () => {

  let mode = 'migrations';

  let num;

  if ( typeof process.argv[2] === 'string') {

    switch (true) {
      case process.argv[2] === 'revert':

        mode = 'revert'

        break;
      case /^\d+$/.test(process.argv[2]):

        mode = 'rollout'

        num = parseInt(process.argv[2], 10);

        break;
      default:

        throw th(`process.argv[2] !== 'revert' nor 'revert'`);

    }
  }

  try {

    const man = knex().model.common;

    let all = [];

    let list = await man.query('show tables');

    list = list.map(RowDataPacket => Object.values(RowDataPacket)[0]);

    let migrationsTableName = config.migrationsTableName || 'migrations';

    // migrationsTableName = 'mig'

    const found = !! (list.find(t => t === migrationsTableName) || []).length;

    let listdb = [];

    if (found) {

      listdb = await man.query(`select name from ??`, [migrationsTableName]);

      listdb = listdb.map(r => parseInt(r.name.replace(/^[^\d]*(\d+).*$/, '$1'), 10));

      all = all.concat(listdb);
    }
    else {

      // show create table `migrations`;
      const queryCreate = `
CREATE TABLE \`${migrationsTableName}\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`timestamp\` bigint(20) NOT NULL,
  \`name\` varchar(255) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8
`;

      await man.query(queryCreate);
    }

    let dir = strip(config.migrations[0]);

    dir = path.resolve(__dirname, '..', '..', dir);

    let listfiles = [];

    let filesbuffor = [];

    let filesbufforkey = {};

    const files = fs.readdirSync(dir);

    //listing all files using forEach
    files.forEach(function (file) {

      const p = path.resolve(dir, file);

      // Do whatever you want to do with the file
      // log.dump({
      //     file,
      //     p,
      //     ex: fs.existsSync(p),
      //     isfile: fs.lstatSync(p).isFile()
      // }, 4)

      if (fs.lstatSync(p).isFile()) {

        const n = parseInt(file.replace(/^[^\d]*(\d+).*$/, '$1'), 10);

        listfiles.push(n);

        const t = {
          p,
          file,
          n,
        };

        filesbuffor.push(t);

        filesbufforkey[n] = t;
      }
    });

    all = all.concat(listfiles);

    all.sort((a, b) => {
      if (a === b) return 0;
      return a > b ? 1 : -1;
    });

    all = all.reduce((acc, name) => {
      acc[name] = {}
      return acc;
    }, {});

    let lastdb      = null;

    let lastfl      = null;

    let lastkey      = false;

    let error        = false;

    // listdb = listdb.filter(r => r !== 1578307203734);
    // listfiles = listfiles.filter(r => r !== 1578981565212);

    Object.keys(all).forEach(key => {

      const k = parseInt(key, 10);

      const d = all[key].db = listdb.includes(k);

      const f = all[key].fl = listfiles.includes(k);

      if (lastdb === false && d === true) {

        all[lastkey].dw = 1;

        error = true;
      }

      if (lastfl === false && f === true) {

        all[lastkey].fw = 1;

        error = true;
      }

      if (all[key].db && !all[key].fl) {

        all[key].ahead = 1;

        error = true;
      }

      if (typeof all[key].db === 'boolean') {

        lastdb = all[key].db;
      }

      if (typeof all[key].fl === 'boolean') {

        lastfl = all[key].fl;
      }

      lastkey = key;
    });

    const keys = Object.keys(all);

    let i = 0;

    const mods = {};

    for ( let key of keys ) {

      i += 1;

      const status = all[key];

      const file = filesbufforkey[key];

      // log.dump({
      //   status,
      //   file,
      // });

      try {

        const mod = requireFromString(convert({
          migrationFile: file.p,
        }), file.p);

        mods[key] = {
          i,
          status,
          file,
          mod,
        }
      }
      catch (e) {

        log.dump({
          place: 'parsing migration error',
          migrationNumber: i,
          status,
          file,
          e: se(e),
        })

        process.exit(1);
      }
    }

    if (mode === 'revert') {

      const values = Object.values(mods);

      let index = values.map(m => m.status.db).lastIndexOf(true);

      if (index === -1) {

        console.log(`\n    Nothing to revert\n`);

        process.exit(0);
      }

      const m = values[index];

      const trx = await knex().transaction();

      try {

        console.log('');

        const queryRunner = {
          query: (...args) => {

            if (args.length === 1) {

              console.log(args[0])
            }
            else {

              log.dump(args)
            }

            return trx.raw(...args).then(result => result[0])
          },
          trx,
        };

        c(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(30, ' ')} reverting\n`, 'y');

        await m.mod.down(queryRunner);

        await trx.raw(
          `delete from \`${migrationsTableName}\` where timestamp = ?`,
          [m.file.n]
        );

        trx.commit();
      }
      catch (e) {

        log.dump({
          m,
          e,
        }, 5)

        trx.rollback();

        throw e;
      }

      c(`\n    reverted\n`, 'y');
    }

    if (mode === 'migrations' || mode === 'rollout') {

      let go = num !== 0;

      const keys = Object.keys(mods);

      const trx = await knex().transaction();

      let m

      try {

        console.log('');

        const queryRunner = {
          query: (...args) => {

            if (args.length === 1) {

              console.log(args[0])
            }
            else {

              log.dump(args)
            }

            return trx.raw(...args).then(result => result[0])
          },
          trx,
        };

        for ( let key of keys ) {

          m = mods[key];

          if (mode === 'rollout' && m.i > num) {

            go = false;
          }

          if ( ! go ) {

            c(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(45, ' ')} not executing - rollout ${num}\n`, 'y');

            continue;
          }

          if ( m.status.db ) {

            c(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(45, ' ')} already executed\n`, 'y');

            continue;
          }

          c(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(45, ' ')} executing\n`, 'y');

          await m.mod.up(queryRunner);

          await trx.raw(
            `insert into \`${migrationsTableName}\` (timestamp, name) values (?, ?)`,
            [m.file.n, `auto${m.file.n}`]
          );
        }

        trx.commit();
      }
      catch (e) {

        log.dump({
          m,
          e,
          completed: trx.isCompleted(),
        }, 5)

        trx.rollback();

        throw e;
      }

      console.log(`\n    all up to date\n`);
    }
  }
  catch (e) {

    const s = String(e);

    if (s.includes(' connect ECONNREFUSED ')) {

      log.dump({
        error: 'NO CONNECTION TO DATABASE',
        credentials: {
          host: config.host,
          port: config.port,
          username: config.username,
          password: "*".repeat((config.password || '').length),
          database: config.database,
        }
      }, 5)
    }
    else {

      log.dump({
        migrate_catch_error: e,
      });
    }

    process.exit(1);
  }

  process.exit(0);
})();

function strip(k) {

  if ( k.includes('*') ) {

    k = trim(k.split('*')[0], '/', 'r');
  }

  return k;
}

