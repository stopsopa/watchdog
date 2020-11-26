
const knex              = require('knex-abstract');

const config            = require('../app/models/config');

const log               = require('inspc');

const db = config.mysql.connection.database;

knex.init(config);

const man = knex().model.common;

(async function () {

    let databases = await man.query('show databases');

    databases = databases.map(l => Object.values(l).pop());

    let tables = await man.query('show tables');

    tables = tables.map(l => Object.values(l).pop());

    log.dump((function ({password, host, port, user, database, ...rest}) {
        return {
            host,
            port,
            user,
            database,
            databases,
            tables,
        };
    }(config.mysql.connection)), 3);

    const mode = process.argv[2];

    if ( ! ( mode === 'safe' || mode === 'dangerous' ) ) {

        console.log(`run: node ${__filename} safe|dangerous`);

        process.exit(1);
    }

    const dangerous = (mode === 'dangerous');

    if (dangerous) {

        try {

            await man.query(`DROP DATABASE IF EXISTS :db:`, {db});
        }
        catch (err) {

            log.dump({
                location: 'migrations => recreate-db.js => 1',
                err,
            }, 4);
        }
    }

    try {

        await man.query(`CREATE DATABASE IF NOT EXISTS :db: /*!40100 DEFAULT CHARACTER SET utf8 */`, {db});

        console.log(dangerous ? 'recreated (DANGEROUS)' : 'just created (SAFE)');
    }
    catch (err) {

        log.dump({
            location: 'migrations => recreate-db.js => 2',
            err,
        }, 4);
    }

    man.destroy();

}());


