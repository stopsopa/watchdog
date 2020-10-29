
const common                    = require('./common');

const projects                  = require('./projects');

const probes                    = require('./probes');

const logger                    = require('./logger');

// images.loadPaths();

const managers = {
    common,
    projects,
    probes,
    logger,
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

