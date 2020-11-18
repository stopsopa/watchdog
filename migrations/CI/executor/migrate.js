/**
 * run all remaining migration
 *
 *    node CI/executor/migrate.js
 *
 * revert last executed migration
 *
 *    node CI/executor/migrate.js revert
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

const th = msg => new Error(`executor/migrate.js error: ${msg}`);

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
    models: new Proxy({
      common: knex => extend(knex, prototype, {}),
    }, {
      get(target, propKey, receiver) {

        if (typeof target[propKey] !== 'undefined') {

          return target[propKey];
        }

        const keys = Object.keys(target);

        throw `No such mysql manager '${propKey}', registered managers are: ` + keys.join(', ');
      },
    }),
  }
});

(async () => {

  let mode = 'migrations';

  if ( typeof process.argv[2] === 'string') {

    if (process.argv[2] !== 'revert') {

      throw th(`process.argv[2] !== 'revert'`);
    }

    mode = 'revert';
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

    if (mode === 'revert') {

      let i = 0;

      for ( let key of keys ) {

        i += 1;

        const status = all[key];

        const file = filesbufforkey[key];

        // log.dump({
        //   i,
        //   status,
        //   file,
        // })
      }
    }

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

      await knex().transaction(async trx => {

        console.log('');

        const queryRunner = {
          query: (...args) => trx.raw(...args)
        };

        console.log(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(30, ' ')} reverting`);

        await m.mod.down(queryRunner);

        await trx.raw(
          `delete from \`${migrationsTableName}\` where name = ?`,
          [`auto${m.file.n}`]
        );
      });

      console.log(`\n    reverted\n`);
    }

    if (mode === 'migrations') {

      const keys = Object.keys(mods);

      await knex().transaction(async trx => {

        console.log('');

        const queryRunner = {
          query: (...args) => trx.raw(...args)
        };

        for ( let key of keys ) {

          const m = mods[key];

          if ( m.status.db ) {

            console.log(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(30, ' ')} already executed`);

            continue;
          }

          console.log(`${String(m.i).padStart(4, ' ')} ${String(m.file.file).padEnd(30, ' ')} executing`);

          await m.mod.up(queryRunner);

          await trx.raw(
            `insert into \`${migrationsTableName}\` (timestamp, name) values (?, ?)`,
            [m.file.n, `auto${m.file.n}`]
          );
        }
      });

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

