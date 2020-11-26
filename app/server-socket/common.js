
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const probeClass       = require('../probeClass');

const driver = require('../probeDriver');

const th = msg => new Error(`common.js error: ${msg}`);

const webpack = require('../../config')(process.env.NODE_ENV);

const {
  getTelegramNodeServerStatus,
} = require('../lib/telegram');

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

  socket.emit('server_status', {
    git_status: {
      NODE_ENV: process.env.NODE_ENV || 'undefined',
      ...buildtime,
    },
    messengers_detection: {
      telegram: (function () {

        const on = typeof process.env.PROTECTED_TELEGRAM_TOKEN === 'string';

        if ( ! on ) {

          return false;
        }

        return {
          PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY: process.env.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY,
        }
      }()),
    },
    getTelegramNodeServerStatus: getTelegramNodeServerStatus(),
  });
}