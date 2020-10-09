/**
 * Script to determine how many migrations were executed until now
 */
const path = require('path');

const log = require('inspc');

const knex              = require('knex-abstract');

const extend            = knex.extend;

const prototype         = knex.prototype;

const config = require(path.resolve(__dirname, '..', 'ormconfig.js'));

require('./chdir');

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

(async function(){

    try {

        const man = knex().model.common;

        let list = await man.query('show tables');

        list = list.map(RowDataPacket => Object.values(RowDataPacket)[0]);

        const migrationsTableName = config.migrationsTableName || 'migrations';

        const found = !! (list.find(t => t === migrationsTableName) || []).length;

        let count = '0';

        if (found) {

            count = await man.queryColumn('select count(*) c from ??', [migrationsTableName]);
        }

        process.stdout.write(String(count));
    }
    catch (e) {

        log.dump({
            mcountdb_catch_error: e,
        });
    }

    process.exit(0);

})();
