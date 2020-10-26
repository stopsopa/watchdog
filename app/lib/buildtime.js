/**
 * 2020-10-26_00-59-37_prod_git_commit_hash_unobtainable
 *  if no .git directory present
 *
 * 2020-10-26_01-00-22_prod_82802-2_2020-10-26_00-11-48
 *  if .git directory works
 */

const path = require("path");

const fs = require("fs");

const log = require('inspc');

const trim = require('nlab/trim');

const mkdirp = require("mkdirp");

const cmd = require('./cmd');

const se = require('nlab/se');

const webpack = require('../../config')('production');

if ( typeof webpack.server.buildtime !== 'string') {

  throw new Error(`webpack.server.buildtime is not a string`);
}

const file = webpack.server.buildtime;

const th = msg => new Error(`buildtime.js error: ${msg}`);

console.log("");

console.log(`Saving ${file}`);

const dir = path.dirname(file);

if ( ! fs.existsSync(dir) ) {

  mkdirp.sync(dir);
}

if (fs.existsSync(file)) {

  fs.unlinkSync(file);
}

if (fs.existsSync(file)) {

  throw th(`Can't remove file '${file}'\n\n\n`);
}

(async function () {

  let hash = '';

  try {

    // throw new Error('');

    let tmp = await cmd(['git', 'rev-parse', '--short', 'HEAD'], {
      // verbose: true,
    });

    tmp = tmp.stdout;

    hash = trim(tmp);
  }
  catch (e) {

    // log.dump({
    //   hash: se(e),
    // })
  }

  try {

    // throw new Error('');

    let tmp = await cmd(['git', 'show', '-s', '--format=%ci', hash]);

    tmp = tmp.stdout;

    tmp = tmp.replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*/g, '$1');

    tmp = tmp.replace(/ /g, '_').replace(/[^\d_]+/g, '-')

    tmp = trim(tmp);

    hash += '_' + tmp;
  }
  catch (e) {

    // log.dump({
    //   tmp: se(e),
    // })
  }

  hash = trim(hash, '_- ')

  const time = (new Date()).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-') + '_prod' + (hash ? ('_' + hash) : '');

  if ( ! fs.existsSync(dir) ) {

    throw th(`Directory '${dir}' doesn't exist and i can't create it`);
  }

  fs.writeFileSync(file, `module.exports = '${time}'`);

  if ( ! fs.existsSync(file)) {

    throw th(`Can't create file '${file}'`);
  }
})();















