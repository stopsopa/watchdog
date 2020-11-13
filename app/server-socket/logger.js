
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const estool                = require('../es/es');

const th = msg => new Error(`logger.js error: ${msg}`);

module.exports = async ({
  io,
  socket,
}) => {

  const man   = knex().model.logger;

  let es = await estool;

  es = await es();

  const index = es.prefix('logger');

}