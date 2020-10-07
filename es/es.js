
const defsession = 'default';

const sessions = {};

const trim = require('lodash/trim');

const isObject = require('nlab/isObject');

const log = require('inspc');

const jsonfetch = require('../lib/jsonfetch');

const th = msg => new Error(`es.js error: ${msg}`);

/**
 *
 * const estool = require('es');
 *
 * estool.setup('https', 'xx.xxx.xxx.xx', 8080, username, password, [name]);
 *
 *
 *
 * or to set multiple connections

 estool.init({
    default: {
      schema      : env('PROTECTED_ES_DEFAULT_SCHEMA'),
      host        : env('PROTECTED_ES_DEFAULT_HOST'),
      port        : parseInt(env('PROTECTED_ES_DEFAULT_PORT'), 10),
      username    : process.env.PROTECTED_ES_DEFAULT_USERNAME, // because es.js might work with servers without credentials (uprotected server)
      password    : process.env.PROTECTED_ES_DEFAULT_PASSWORD,
    }
  });
 *
 * const es = estool([name]); - name optional
 *
 * es('/target/path', {
 *   body: {test: 'json data'}
 * });
 *
 *
 *
 (async function () {

    try {

        const data = await es('/_mapping');

        log.dump({
            allgood: data
        }, 100)
    }
    catch (e) {

        log.dump({
            es_error: e,
        }, 4)
    }
}())
 *
 * @param ses
 * @returns {Function}
 */
const tool = ses => {

    if ( ! ses ) {

        ses = defsession;
    }

    const config = sessions[ses];

    if ( ! config ) {

        throw new Error(`es.js: first use method .setup() to configure connection`);
    }

    const reg = /^https?:\/\//i;

    const {
        domain,
        auth,
    } = config;

    /**
     * Examples:
     *      es('/url') - send get query to '/url' path
     *
     *      es('/url', {
     *        body: { data: 'value' }
     *      }) - send POST request to '/url' with json data
     *
     *      es('/url', {
     *        body: { data: 'value' }
     *        method: 'PUT'
     *      })
     */
    return (path, opt = {}) => {

        if ( ! reg.test(path) ) {

            path = domain + path;
        }

        let {
            headers = {},
            ...rest
        } = opt;

        headers['Authorization'] = auth;

        return jsonfetch(path, {
            headers,
            ...rest,
        });
    }
}

const validate = (name, value, type = 'string') => {

    if (type === 'string') {

        if ( typeof value !== 'string' ) {

            throw new Error(`es.js: setup() - '${name}' parameter is not a string`);
        }

        if ( ! trim(value) ) {

            throw new Error(`es.js: setup() - '${name}' parameter is an empty string`);
        }

        return;
    }

    if (type === 'integer') {

        if ( ! Number.isInteger(value) ) {

            throw new Error(`es.js: setup() - '${name}' parameter is not a number`);
        }

        if ( value < 1 ) {

            throw new Error(`es.js: setup() - '${name}' parameter is < 1`);
        }

        return;
    }

    throw new Error(`es.js: validate() - unknown type: '${type}'`);
}

tool.init = list => {
    if (isObject(list)) {

        console && console.log && console.log(`\ninitializing es.js library based on given configuration\n`);

        return Object.keys(list).forEach(key => {

            const {
                schema,
                host,
                port,
                username,
                password,
            } = list[key];

            tool.setup(
                schema,
                host,
                port,
                username,
                password,
                key,
            );
        })
    }

    console && console.log && console.log(`\nconfiguration for es.js library not found\n`);
}

tool.setup = (schema, host, port, username, password, sessionName) => {

    if ( ! sessionName ) {

        sessionName = defsession;
    }

    if ( username ) {
        validate('username', username);
    }

    if ( password ) {
        validate('password', password);
    }

    validate('host', host);

    validate('port', port, 'integer');

    if ( ! /^https?$/.test(schema) ) {

        throw new Error(`es.js: setup() - schema should be http or https`);
    }

    if (sessions[sessionName]) {

        console && console.log && console.log(`WARNING: es.js: setup() - configuration '${sessionName}' it was already set - override mode`);
    }

    sessions[sessionName] = {
        schema,
        host,
        port: String(port),
        domain: `${schema}://${host}` + ( (port === 80) ? `` : `:${port}`),
    };

    if ( username && password ) {

        sessions[sessionName].auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    }

    return tool;
};

module.exports = tool;