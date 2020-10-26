
const fs        = require('fs');

const template  = require('lodash/template');

const th        = msg => new Error(`server-template.js error: ${msg}`);

module.exports = ({
    buildtime,
    file,
    replace = (content, buildtime) => {

        const reg       = /([&\?])__/g;

        return content.replace(reg, `$1_=${buildtime}`)
    }
}) => {

    if ( typeof replace !== 'function' ) {

        throw th(`replace param is not a function`);
    }

    if ( typeof file !== 'string' ) {

        throw th(`file param is not a string`);
    }

    if ( ! file.trim() ) {

        throw th(`file param is an empty string`);
    }

    if ( typeof buildtime !== 'string' ) {

        throw th(`buildtime param is not a string`);
    }

    if ( ! buildtime.trim() ) {

        throw th(`buildtime param is an empty string`);
    }

    if ( ! fs.existsSync(file)) {

        throw th(`file '${file}' doesn't exist`);
    }

    try {

        fs.accessSync(file, fs.constants.R_OK);
    }
    catch (e) {

        throw th(`file '${file}' is not readdable`);
    }

    let content = fs.readFileSync(file).toString();

    try {

        content = template(replace(content, buildtime);
    }
    catch (e) {

        throw th(`binding template '${file}' error, probably syntax error: ${JSON.stringify(se(e))}`);
    }

    return params => {

        try {

            return content(params);
        }
        catch (e) {

            throw th(`parsing template '${file}' error: : ${JSON.stringify(se(e))}`);
        }
    }
};