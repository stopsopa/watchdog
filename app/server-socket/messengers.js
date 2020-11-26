
const log = require('inspc');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const { extractRequest } = require('../lib/telegram')

const th = msg => new Error(`telegram.js error: ${msg}`);

module.exports = ({
  io,
  socket,
  telegramMiddleware,
}) => {

  // socket.on('messengers_detect', async () => {
  //
  //   socket.emit('messengers_detect', {
  //     telegram: typeof process.env.PROTECTED_TELEGRAM_TOKEN === 'string',
  //   })
  // });
}