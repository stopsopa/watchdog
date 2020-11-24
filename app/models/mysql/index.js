
const common                    = require('./common');

const projects                  = require('./projects');

const probes                    = require('./probes');

const logger                    = require('./logger');

const users                     = require('./users');

const groups                    = require('./groups');

// images.loadPaths();

const managers = {
    common,
    projects,
    probes,
    logger,
    users,
    groups,
};

/**
 * http://2ality.com/2014/12/es6-proxies.html
 */
module.exports = new Proxy(managers, {
    get(target, propKey, receiver) {

        if (typeof target[propKey] !== 'undefined') {

            return target[propKey];
        }

        const keys = Object.keys(target);

        throw `No such mysql manager '${propKey}', registered managers are: ` + keys.join(', ');
    },
});

