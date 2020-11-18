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

const padStart = require('lodash/padStart');

const { createConnection } = require("typeorm");

const config = require(path.resolve(__dirname, '..', 'ormconfig.js'));

const log = require('inspc');

const mkdirp = require('mkdirp');

require('./chdir');

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

const c = (...args) => color(...args);

(async () => {

    let connection;

    try {

        let all = [];

        connection = await createConnection(config);

        let list = await connection.manager.query(`show tables`);

        const migrationsTableName = connection.options.migrationsTableName || 'migrations';

        list = list.map(RowDataPacket => Object.values(RowDataPacket)[0]);

        const found = !! (list.find(t => t === migrationsTableName) || []).length;

        let listdb = [];

        if (found) {

            listdb = await connection.manager.query(`select name from ??`, [migrationsTableName]);

            listdb = listdb.map(r => parseInt(r.name.replace(/^[^\d]*(\d+).*$/, '$1'), 10));

            all = all.concat(listdb);
        }

        await connection.close();

        let dir = strip(config.migrations[0]);

        dir = path.resolve(__dirname, '..', dir);

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

                    let raw = fs.readFileSync(filesbufforkey[key].p, 'utf8').toString().split("\n").map(r => r.trim()).filter(r => r.indexOf('///') === 0)[0] || '';

                    raw = trim(raw, '/ ');

                    return ` ${raw}`;
                }
                catch (e) {

                    return '';
                }
            }()) || '';

            let t = padStart(i + 1, 4, ' ')
                + ' ' + key
                + '    db: '
                + (all[key].db ? c('✓', 'g') : c('✗', 'r'))
                + '    fl: '
                + (all[key].fl ? c('✓', 'g') : c('✗', 'r'))
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
