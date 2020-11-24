
const abstract          = require('knex-abstract');

const extend            = abstract.extend;

const prototype         = abstract.prototype;

const log               = require('inspc');

const a                 = prototype.a;

const table             = 'user_group';

module.exports = knex => extend(knex, prototype, {
}, table);