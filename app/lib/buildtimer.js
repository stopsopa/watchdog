/**
 *
 * node app/lib/buildtimer.js --test
 *
 *
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

const th = msg => new Error(`buildtimer.js error: ${msg}`);

const webpack = require('../../config')('production');

if ( typeof webpack.server.buildtime !== 'string') {

  throw th(`webpack.server.buildtime is not a string`);
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

  throw th(`Can't remove file '${file}'\n\n\n`);
}

(async function () {

  let lib = {};

  try {

    // throw new Error('');

    let tmp = await cmd(['git', 'rev-parse', '--short', 'HEAD'], {
      // verbose: true,
    });

    tmp = tmp.stdout;

    tmp = trim(tmp, '-_ ')

    lib.githash = trim(tmp);

    try {

      // throw new Error('');
      if (lib.githash) {

        let tmp = await cmd(['git', 'show', '-s', '--format=%ci', lib.githash]);

        tmp = tmp.stdout;

        tmp = tmp.replace(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}).*/g, '$1');

        tmp = tmp.replace(/ /g, '_').replace(/[^\d_]+/g, '-')

        tmp = trim(tmp);

        tmp = trim(tmp, '-_ ')

        lib.gittime = tmp;
      }
    }
    catch (e) {

      // log.dump({
      //   tmp: se(e),
      // })
    }
  }
  catch (e) {

    // log.dump({
    //   lib: se(e),
    // })
  }

  lib.mode = 'prod';

  lib.time = (new Date()).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-')

  console.log({
    buildtime: lib
  })

// PROJECT_NAME              : watchdog
// PROJECT_NAME_SHORT        : watchdog
// TZ                        : UTC
// NODE_PORT                 : 80
// NODE_HOST                 : 0.0.0.0
// TAG                       : 0.0.1
// DEPLOYMENT_TAG            : 0.0.38-master
// BUILD_NUMBER              : 57
// BUILD_TIME                : 2020-11-06 15:31:58
// GIT_COMMIT                : 47fad9b4

function buildtime(d) {

  if (process.env.GIT_COMMIT) {

    d.githash = process.env.GIT_COMMIT;
  }

  if (process.env.BUILD_TIME) {

    d.gittime = process.env.BUILD_TIME.replace(/:/g, '-').replace(/ /g, '_');
  }

  const t = [];

  d.time      && t.push(d.time);

  d.mode      && t.push(d.mode);

  d.githash   && t.push(d.githash);

  d.gittime   && t.push(d.gittime);

  return t.join('_');
}

  lib = `
module.exports = (${buildtime.toString()}(${JSON.stringify(lib, null, 4)}))
`

  if ( ! fs.existsSync(dir) ) {

    throw th(`Directory '${dir}' doesn't exist and i can't create it`);
  }

  fs.writeFileSync(file, lib);

  if ( ! fs.existsSync(file)) {

    throw th(`Can't create file '${file}'`);
  }

  if (process.argv.includes('--test')) {

    console.log({
      test: require(file),
    });
  }
})();















