
const log = require('inspc');

module.exports = (...args) => {

  require('./projects')(...args);

  require('./probes')(...args);
}