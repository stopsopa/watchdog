/**
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 * Not used now, see server.config.js key "knex"
 */

require('dotenv-up')({
    override    : false,
    deep        : 3,
}, false, 'tests');

const mysql = require('./mysql');

const env = name => {

  if ( typeof process.env[name] !== 'string' ) {

    throw new Error(`config.js process.env.${name} doesn't exist`);
  }

  if ( ! process.env[name].trim() ) {

    throw new Error(`config.js process.env.${name} is an empty string`);
  }

  return process.env[name];
}

module.exports = {
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

      // timezone: 'UTC' // https://github.com/knex/knex/issues/1461#issuecomment-222768525
      // actually knex timezone is inherited from process.env.TZ
      // can be tested with
      // await man.query("SET GLOBAL time_zone = 'UTC';SET SESSION time_zone = 'UTC';")
      // log.dump({
      //     timezone: await man.query('SELECT @@GLOBAL.time_zone, @@SESSION.time_zone;'),
      //     test: (new Date()).toString(),
      // })
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
};