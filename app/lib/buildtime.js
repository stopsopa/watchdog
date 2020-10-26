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

  throw `\n\n\n       Error: Can't remove file '${file}'\n\n\n`;
}


(async function () {

  let hash = '';

  try {

    hash = await cmd(['git', 'rev-parse', '--short', 'HEAD'], {
      // verbose: true,
    });

    hash = hash.stdout;

    hash = trim(hash);
  }
  catch (e) {

    // log.dump({
    //   hash: se(e),
    // })
  }

  let tmp = '';

  try {

    tmp = await cmd(['git', 'show', '-s', '--format=%ci', hash]);

    tmp = tmp.stdout;

    tmp = trim(tmp);

    hash += '_' + tmp;
  }
  catch (e) {

    // log.dump({
    //   tmp: se(e),
    // })
  }

  hash = trim(hash.replace(/ /g, '_').replace(/[^\d_]+/g, '-'), '-_0');

  if ( ! hash ) {

    hash = 'git_commit_hash_unobtainable'
  }

  const time = (new Date()).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-') + '_prod_' + hash;

  if ( ! fs.existsSync(dir) ) {

    throw `\n\n\n       Error: Directory '${dir}' doesn't exist and i can't create it\n\n\n`;
  }

  fs.writeFileSync(file, `module.exports = '${time}'`);

  if ( ! fs.existsSync(file)) {

    throw `\n\n\n       Error: Can't create file '${file}'\n\n\n`;
  }
})();















