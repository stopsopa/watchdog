/**
 * Script to determine how many migrations were executed until now
 * (cd CI && node info.js --silent)
 * (cd CI && node info.js --bashfuse)
 * (cd CI && node info.js --total)
 * (cd CI && node info.js --current)
 *      # just return number of all migrations available (1 indexed), no mater if executed agains database or not
 *
 * (cd CI && node info.js --move-files-before-movesh 80)
 *       (cd CI && node info.js --move-back) -- command to put files back
 *
 */
const path = require('path');

const fs = require('fs');

const trim = require('nlab/trim');

const padEnd = require('lodash/padEnd');

const { createConnection } = require("typeorm");

const config = require(path.resolve(__dirname, '..', 'ormconfig.js'));

const log = require('inspc');

const mkdirp = require('mkdirp');

require('./chdir');

const th = msg => new Error(`${path.basename(__filename)} error: ${msg}`);

const isRegularMigration = (function () {

    const regMultilineComments = /\/\*[\s\S]*?\/*\//g;

    const regNameProp = /^name\s+=\s+\'[^']+\'$/;

    // import {MigrationInterface, QueryRunner} from "typeorm";
    const regImport = /^import\s+{\s*MigrationInterface\s*,\s*QueryRunner\s*}\s+from\s+"typeorm";$/;

    // export class auto1544315675515 implements MigrationInterface {
    const regClass = /^export\s+class\s+[^\s]+\s+implements\s+MigrationInterface\s+\{$/;

    return function (file, returnParts = false) {

        let content = fs.readFileSync(file, 'utf8').toString();

        content = content.replace(regMultilineComments, '');

        content = content.split("\n");

        content = content.map(row => trim(row)).filter(Boolean);

        content = content.filter(row => row.indexOf('//') !== 0);

        content = content.filter(row => (!regNameProp.test(row)));

        // testing

        // return content;

        if ( ! regImport.test(content[0]) ) {

            throw th(`first line \n'${content[0]}'\n of file \n'${file}'\n don't match regex: '${regImport}'`);
        }

        if ( ! regClass.test(content[1]) ) {

            throw th(`second line \n'${content[1]}'\n of file \n'${file}'\n don't match regex: '${regClass}'`);
        }







    }
}());


(async () => {

    let connection;

    try {

        let all = [];

        let listdb = [];

        let listfiles = [];

        connection = await createConnection(config);

        let list = await connection.manager.query(`show tables`);

        const migrationsTableName = connection.options.migrationsTableName || 'migrations';

        list = list.map(RowDataPacket => Object.values(RowDataPacket)[0]);

        const found = !! (list.find(t => t === migrationsTableName) || []).length;

        if (found) {

            listdb = await connection.manager.query(`select name from ?? order by timestamp`, [migrationsTableName]);

            listdb = listdb.map(r => ({
                dbrecord: r.name,
                id: parseInt(r.name.replace(/^[^\d]*(\d+).*$/, '$1'), 10),
            }));

            all = all.concat(listdb);
        }

        all = all.reduce((acc, val) => {

            // acc[val.id] = val;

            acc[val.id] = {
                dbrecord: val.dbrecord,
            };

            return acc;
        }, {});

        await connection.close();

        let dir = strip(config.migrations[0]);

        dir = path.resolve(__dirname, '..', dir);

        let filesbuffor = [];

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
            }
        });

        filesbuffor.sort((a, b) => {

            if (a.n === b.n) {

                return 0;
            }

            return (a.n > b.n) ? 1 : -1;
        }).forEach(r => {

            if ( ! all[r.n] ) {

                all[r.n] = {};
            }

            all[r.n].file   = r.p;
        });

        Object.keys(all).forEach(key => {

            const r = all[key];

            if ( ! r.file ) {

                throw th(`file field is missing in: ${JSON.stringify(r, null, 4)}`);
            }

            if ( ! r.dbrecord ) {

                throw th(`dbrecord field is missing in: ${JSON.stringify(r, null, 4)}`);
            }

            r.regular = isRegularMigration(r.file);
        });



        let content = isRegularMigration('/Users/sd/Workspace/projects/z_roderic_new/roderic-project/migrations/src/migration/1592527414724-auto.ts');


        log.dump({content});

        process.exit(0);




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

        function preparedir() {

            let tmpts = config.tmpts;

            tmpts = path.resolve(__dirname, '..', tmpts);

            if ( ! fs.existsSync(tmpts) ) {

                mkdirp.sync(tmpts);
            }

            if ( ! fs.existsSync(tmpts) ) {

                throw new Error(`tmp: ${tmpts} can't be created`);
            }

            return tmpts;
        }

        if ( process.argv.includes('--move-back') ) {

            /**
             echo 'a' >  src/tmpts/a.log && echo 'b' > src/tmpts/b.log
             (cd CI && node info.js --move-back)

             */

            let tmpts = preparedir();

            tmpts = path.resolve(__dirname, '..', tmpts);

            if ( ! fs.existsSync(tmpts) ) {

                mkdirp.sync(tmpts);
            }

            if ( ! fs.existsSync(tmpts) ) {

                throw new Error(`tmp: ${tmpts} can't be created`);
            }

            const files = fs.readdirSync(tmpts);

            const list = [];

            files.forEach(function (file) {

                const p = path.resolve(tmpts, file);

                if (fs.lstatSync(p).isFile()) {

                    list.push({
                        p,
                        file,
                    });
                }
            });

            console.log(`move back:`);

            for (let f of list) {

                const target = path.resolve(dir, f.file);

                console.log(`move ${f.p} -> ${target}`);

                fs.renameSync(f.p, target);
            }

            fs.existsSync(tmpts) && fs.rmdirSync(tmpts);

            process.exit(0);
        }

        function current() {

            let executed = Object.values(all).map(r => r.db);

            const index = executed.findIndex(r => r === false);

            if (index > -1) {

                executed = executed.slice(0, index);
            }

            return executed.length;
        }

        if ( process.argv.includes('--move-files-before-movesh') ) {

            let n = process.argv[3] || '';

            if ( ! /^\d+$/.test(n) ) {

                console.log(`n don't match /^\\d+$/ it is: '${n}'`);

                process.exit(1);
            }

            n = parseInt(n, 10);

            let rest = Object.keys(all).slice(n);

            let found = rest.reduce((acc, int) => {

                const found = filesbuffor.find(r => r.n === int);

                if (found) {

                    acc.push(found);
                }

                return acc;
            }, []);

            let tmpts = preparedir();

            console.log(`move files before movesh:`);

            for (let f of found) {

                const target = path.resolve(tmpts, f.file);

                console.log(`move ${f.p} -> ${target}`);

                fs.renameSync(f.p, target);
            }

            process.exit(0)
        }

        if ( process.argv.includes('--current') ) {

            process.stdout.write(String(current()));

            process.exit(0);
        }

        if ( process.argv.includes('--total') ) {

            process.stdout.write(String(Object.keys(all).length));

            process.exit(0);
        }

        const report = Object.keys(all).reduce((acc, key, i) => {

            const comment = (function () {
                try {

                    let raw = fs.readFileSync(filesbuf_____________________________________forkey[key].p, 'utf8').toString().split("\n").map(r => r.trim()).filter(r => r.indexOf('///') === 0)[0] || '';

                    raw = trim(raw, '/ ');

                    return ` ${raw}`;
                }
                catch (e) {

                    return '';
                }
            }()) || '';

            let t = padEnd(i + 1, 4, ' ')
                + ' ' + key
                + '    db: '
                + (all[key].db ? '✓' : '✗')
                + '    fl: '
                + (all[key].fl ? '✓' : '✗')
                +   (
                    all[key].dw ?
                        ' db missing '
                        :
                        '            '
                )
                +   (
                    all[key].fw ?
                        ' file missing '
                        :
                        '              '
                )
                +   (
                    all[key].ahead ?
                        ' db ahead '
                        :
                        '          '
                )
                + (
                    comment
                )
            ;

            acc.push(t)

            return acc;
        }, [])

        if ( ! process.argv.includes('--silent') && ! process.argv.includes('--bashfuse') ) {

            console.log(report.join("\n"))

            console.log(error ? "\n      FOUND ERROR !!!\n" : 'All good...')
        }

        if (process.argv.includes('--bashfuse')) {

            console.log("");

            console.log(`Checking integrity of previous migrations:`)

            if (error) {

                console.log(report.join("\n"))

                console.log(error ? "\n      FOUND ERROR !!!\n" : 'All good...')
            }
            else {

                console.log('    All good');
            }

            console.log("");
        }

        process.exit(error ? 1 : 0);
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

            process.exit(1);

        }
        else {

            console.log('CATCH ERROR: ', String(e));

            await connection.close();

            setTimeout(() => process.exit(1), 1);

            throw e;
        }
    }

})()

function strip(k) {

    if ( k.includes('*') )  {

        k = trim(k.split('*')[0], '/', 'r');
    }

    return k;
}
