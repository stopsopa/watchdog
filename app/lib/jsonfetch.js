
const URL           = require('url').URL;

const https         = require('https');

const http          = require('http');

const querystring   = require('querystring');

const isObject      = require('nlab/isObject');

const log           = require('inspc');

const emsg          = msg => `jsonfetch: ${msg}`;

const th            = msg => new Error(emsg(msg));

module.exports = function jsonfetch (url, opt = {}) {

  let {
    method      = 'GET',
    timeout     = 30 * 1000,
    get         = {},
    headers     = {},
    debug       = false,
    body,
    nobody      = false,
  } = opt;

  if ( typeof method !== 'string' ) {

    throw th(`method is not a string`);
  }

  method = method.toUpperCase();

  return new Promise((resolve, reject) => {

    const uri   = new URL(url);

    const lib   = (uri.protocol === 'https:') ? https : http;

    const query = querystring.stringify(get)

    if (isObject(body) || Array.isArray(body)) {

      if (method === 'GET') {

        method = 'POST';
      }

      try {

        body = JSON.stringify(body);
      }
      catch (e) {

        return reject(emsg(`JSON.stringify error: ${e}`));
      }

      headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    const rq = {
      hostname    : uri.hostname,
      port        : uri.port || ( (uri.protocol === 'https:') ? '443' : '80'),
      path        : uri.pathname + uri.search + (query ? (uri.search.includes('?') ? '&' : '?') + query : ''),
      method,
      headers,
    };

    if (debug) {

      log.dump({
        rq,
      }, 6);
    }

    var req = lib.request(rq, res => {

      res.setEncoding('utf8');

      let body = '';

      res.on('data', chunk => {

        body += chunk
      });

      res.on('end', () => {

        const isJson = (function () {

          try {

            return res.headers['content-type'].includes('application/json');
          }
          catch (e) {

            return false;
          }
        }());

        if (isJson) {

          try {

            body = JSON.parse(body);
          }
          catch (e) {

            reject(emsg(`JSON.parse(response body) error: ${e}`))
          }
        }

        const payload = {
          status: res.statusCode,
          headers: res.headers,
        };

        if (nobody === false) {

          payload.body = body;
        }

        resolve(payload)
      });
    });

    req.on('socket', function (socket) { // uncomment this to have timeout

      socket.setTimeout(timeout);

      socket.on('timeout', () => { // https://stackoverflow.com/a/9910413/5560682

        req.abort();

        reject(emsg(`timeout (${timeout}ms)`))
      });
    });

    req.on('error', e => reject(emsg(`on error: ${e}`)));

    body && req.write(body);

    req.end();
  });
}


