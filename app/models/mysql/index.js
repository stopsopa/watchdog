
const common                    = require('./common');

const projects                  = require('./projects');

const probes                    = require('./probes');

const users                     = require('./users');

const groups                    = require('./groups');

const user_groups               = require('./user_groups');

const postbox                   = require('./postbox');

const postbox_group             = require('./postbox_group');

const postbox_user              = require('./postbox_user');

// images.loadPaths();

const managers = {
    common,
    projects,
    probes,
    users,
    groups,
    user_groups,
    postbox,
    postbox_group,
    postbox_user,
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

