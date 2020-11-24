
const log = require('inspc');

module.exports = (...args) => {

  require('./common')(...args);

  require('./projects')(...args);

  require('./probes')(...args);

  require('./logs')(...args);

  require('./logger')(...args);

  require('./users')(...args);

  require('./groups')(...args);
}