
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

        content = template(replace(content, buildtime));
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