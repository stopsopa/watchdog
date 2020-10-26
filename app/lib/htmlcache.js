
const fs = require('fs');

const path = require('path');

const log = require('inspc');

const reg = /([&\?]_=)\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}/g;

function now() {
    return (new Date()).toISOString().substring(0, 19).replace('T', '_').replace(/[^\d_]/g, '-');
}

function replace(content, opt = {}) {

    if (typeof opt.isProd === 'undefined') {

        throw `htmlcache.js: isProd flag expected`;
    }

    if (typeof content !== 'string') {

        throw `content is not string`;
    }

    let time = opt.time;

    if (opt.isProd && ! opt.time ) {

        if ( ! opt.file ) {

            throw `htmlcache.js: if there is no 'time' parameter there should be given 'file' parameter`;
        }

        const file = opt.file;

        if ( ! fs.existsSync(file)) {

            throw `\n\n\n       Error: Can't find file '${file}' and I should be able to because it's production mode\n\n\n`;
        }

        time = eval('require')(file);

        log(`found in file '${file}': ${time}`);
    }
    else {

        time = time || now();

        time += '_dev';
    }

    return content.replace(reg, `$1${time}`);
}

replace.now = now;

replace.inFile = function (file, time) {

    if ( ! fs.existsSync(file)) {

        throw `file '${file}' doesn't exist`;
    }

    try {
        fs.accessSync(file, fs.constants.R_OK);
    }
    catch (e) {

        throw `file '${file}' is not readdable`;
    }

    try {
        fs.accessSync(file, fs.constants.W_OK);
    }
    catch (e) {

        throw `file '${file}' is not writtable`;
    }

    const content = replace(fs.readFileSync(file).toString(), {
        time
    });

    fs.writeFileSync(file, content);

    return content;
};

// if (require && module && require.main === module) {
//
//     const list = process.argv.slice(2);
//
//     if (list.length) {
//
//         list.forEach(replace.inFile);
//     }
//     else {
//
//         const path = require('path');
//
//         console.error(`run:\n    node ${path.basename(__filename)} [path to file]`);
//
//         process.exit(1);
//     }
//
// }


module.exports = replace;