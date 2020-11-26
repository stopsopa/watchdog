
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const probeClass       = require('../probeClass');

const driver = require('../probeDriver');

const th = msg => new Error(`common.js error: ${msg}`);

const webpack = require('../../config')(process.env.NODE_ENV);

module.exports = ({
  io,
  socket,
}) => {

  let buildtime = false;

  if (process.env.NODE_ENV === 'production') {

    try {

      const lib = require(webpack.server.buildtime);

      buildtime = lib.getObj();
    }
    catch (e) {

      throw th(`require(${webpack.server.buildtime}) failed: ` + String(e));
    }
  }

  socket.emit('git_status', {
    git_status: {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      ...buildtime,
    },
    messengers_detection: {
      telegram: typeof process.env.PROTECTED_TELEGRAM_TOKEN === 'string',
    },
  });
}