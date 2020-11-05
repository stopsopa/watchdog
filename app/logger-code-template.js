
const se = require('nlab/se');

const originalUrl = require('original-url');

module.exports = async function (req) {

  const original = originalUrl(req);

  const common = {
    ip      : req.clientIp,
    query   : req.query,
    body    : req.body,
    method  : req.method,
    headers : req.headers,
    original,
  }

  try {

    return {
      probe: true,
      ...common,
    }
  }
  catch (e) {

    // remember also to properly handle any potential errors

    return {
      probe: false, // still "probe" key with boolean value type is required
      catch: se(e),
      ...common,
    }
  }
}

// curl -XPOST -d '{"foo": "bar"}' -H 'content-type: application/json' http://localhost:1046/passive/45?password=ppp&a=b&test=getval
// {
//   "ip": "127.0.0.1",
//   "query": {
//     "password": "ppp"
//   },
//   "body": {
//     "foo": "bar"
//   },
//   "method": "POST",
//   "headers": {
//     "host": "localhost:1046",
//     "user-agent": "curl/7.64.1",
//     "accept": "*/*",
//     "content-type": "application/json",
//     "content-length": "14"
//   },
//   "original": {
//     "raw": "/test?password=ppp",
//     "protocol": "http:",
//     "hostname": "localhost",
//     "port": 1046,
//     "pathname": "/test",
//     "search": "?password=ppp",
//     "full": "http://localhost:1046/test?password=ppp"
//   }
// }