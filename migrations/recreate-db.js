
const knex              = require('knex-abstract');

const se                = require('nlab/se');

const log               = require('inspc');

const config            = require('../app/models/config');

const db = config.mysql.connection.database;

delete config.mysql.connection.database;

knex.init(config);

const man = knex().model.common;

const mode = process.argv[2];

(async function () {

    async function info () {

        const info = (function ({host, port, user, database}) {
            return {
                host,
                port,
                user,
                database    : db,
                databases   : 'not extracted',
                tables      : 'not extracted',
            };
        }(config.mysql.connection));

        try {

            let databases = await man.query('show databases');

            info.databases = databases.map(l => Object.values(l).pop());
        }
        catch (e) {

            error = String(e.e || e.message);

            if (error.includes('ECONNREFUSED')) {

                log.dump(info, 3);

                log.dump({
                    error,
                })

                process.exit(1);
            }
            else {

                log.dump({
                    show_database_error: e,
                })
            }
        }

        try {

            await man.query(`use ${db}`);

            let tables = await man.query('show tables');

            info.tables = tables.map(l => Object.values(l).pop());

            if ( Array.isArray(info.tables) && info.tables.length === 0 ) {

                info.tables = `No tables in database ${db}`;
            }
        }
        catch (e) {

            if ( ! String(e).includes('Unknown database')) {

                throw e;
            }

            info.tables = e.e || e.message;
        }

        log.dump(info, 3);
    };

    try {

        if ( ! /^(dangerous|safe|delete)$/.test(mode) ) {

            await info();

            console.log(`
    run: node ${__filename} safe|dangerous|delete

`);

            process.exit(1);
        }

        if ( /^(dangerous|delete)$/.test(mode) ) {

            try {

                await man.query(`DROP DATABASE IF EXISTS :db:`, {db});

                if (mode === 'delete') {

                    await info();

                    console.log('')
                    console.log(`database '${db}' deleted`);
                    console.log('')
                }
            }
            catch (err) {

                log.dump({
                    location: 'migrations => recreate-db.js => 1',
                    err,
                }, 4);
            }
        }

        if (mode !== 'delete') {

            await man.query(`CREATE DATABASE IF NOT EXISTS :db: /*!40100 DEFAULT CHARACTER SET utf8 */`, {db});

            await info();

            console.log('')
            console.log((mode === 'dangerous') ? 'recreated (DANGEROUS) - database recreated' : 'just created (SAFE) - database created');
            console.log('')
        }
    }
    catch (e) {

        log.dump({
            recreate_general_catch: se(e),
        }, 4);
    }

    man.destroy();

}());


