
const fs        = require('fs');

const template  = require('lodash/template');

const se        = require('nlab/se');

const th        = msg => new Error(`server-template.js error: ${msg}`);

/**
 *
 const template = require('./app/lib/server-template')({
    buildtimefile   : webpack.server.buildtime,
    tempatefile     : path.resolve(web, 'index.html'),
    isProd          : process.env.NODE_ENV === "production",
  })

 full example:

    (function () {

      const ifDevUseFileModificationTime = (function () {

        if (process.env.NODE_ENV !== "production") {

          try {

            const w           = eval('require')('./webpack.config');

            return path.resolve(w.output.path, w.output.filename.replace(/\[name\]/g, Object.keys(w.entry)[0]));
          }
          catch (e) {

            log.dump({
              ifDevUseFileModificationTime_error: e,
            })
          }
        }
      }());

      const template = require('./app/lib/server-template')({
        buildtimefile   : webpack.server.buildtime,
        tempatefile     : path.resolve(web, 'index.html'),
        isProd          : process.env.NODE_ENV === "production",
      })

      app.get('*', (req, res) => {

        let mtime;

        if (ifDevUseFileModificationTime) {

          try {

            if (fs.existsSync(ifDevUseFileModificationTime)) {

              const stats = fs.statSync(ifDevUseFileModificationTime);

              mtime = (stats.mtime).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-') + '_dev_mtime'
            }
          }
          catch (e) {}
        }

        let tmp = template({
          mode            : process.env.NODE_ENV || 'undefined',
          mtime,
        });

        res.send(tmp);
      });
    }());

 and in index.html use:


 <link rel="stylesheet" href="/other/normalize.css<%= mtime ? `?_=` + mtime : `?__` %>">
 */

module.exports = ({
    buildtimefile,
    tempatefile,
    replace = (content, buildtime) => {

        const reg       = /([&\?])__/g;

        return content.replace(reg, `$1_=${buildtime}`)
    },
    isProd,
}) => {

    if ( typeof replace !== 'function' ) {

        throw th(`replace param is not a function`);
    }

    if ( typeof tempatefile !== 'string' ) {

        throw th(`tempatefile param is not a string`);
    }

    if ( ! tempatefile.trim() ) {

        throw th(`tempatefile param is an empty string`);
    }

    if ( typeof buildtimefile !== 'string' ) {

        throw th(`buildtimefile param is not a string`);
    }

    if ( ! buildtimefile.trim() ) {

        throw th(`buildtimefile param is an empty string`);
    }

    let buildtime;

    if (isProd) {

        if ( ! fs.existsSync(buildtimefile)) {

            throw th(`buildtimefile '${buildtimefile}' doesn't exist`);
        }

        try {

            fs.accessSync(buildtimefile, fs.constants.R_OK);
        }
        catch (e) {

            throw th(`buildtimefile '${buildtimefile}' is not readdable`);
        }

        buildtime = eval('require')(buildtimefile);
    }
    else {

        buildtime = (new Date()).toISOString().substring(0, 19).replace('T', '_').replace(/:/g, '-') + '_dev'
    }

    if ( ! fs.existsSync(tempatefile)) {

        throw th(`tempatefile '${tempatefile}' doesn't exist`);
    }

    try {

        fs.accessSync(tempatefile, fs.constants.R_OK);
    }
    catch (e) {

        throw th(`tempatefile '${tempatefile}' is not readdable`);
    }

    let content = fs.readFileSync(tempatefile).toString();

    try {

        content = replace(content, buildtime);

        content = template(content);
    }
    catch (e) {

        throw th(`binding template '${tempatefile}' error, probably syntax error: ${JSON.stringify(se(e))}`);
    }

    return params => {

        try {

            return content(params);
        }
        catch (e) {

            throw th(`parsing template '${tempatefile}' error: : ${JSON.stringify(se(e))}`);
        }
    }
};