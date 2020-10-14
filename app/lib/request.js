
const URL           = require('url').URL;

const https         = require('https');

const http          = require('http');

const querystring   = require('querystring');

const serializeError = require('nlab/serializeError');

const th            = msg => new Error(`request: ${String(msg)}`);

const log           = require('inspc');

module.exports = function request(url, opt = {}) {

  let {
    method      = 'GET',
    timeout     = 30 * 1000,
    get         = {},
    verbose     = true,
  } = opt;

  if ( typeof method !== 'string' ) {

    throw th(`method is not a string`);
  }

  method = method.toLowerCase();

  return new Promise((resolve, reject) => {

    const uri   = new URL(url);

    const lib   = (uri.protocol === 'https:') ? https : http;

    const query = querystring.stringify(get)

    const rq = {
      hostname    : uri.hostname,
      port        : uri.port || ( (uri.protocol === 'https:') ? '443' : '80'),
      path        : uri.pathname + uri.search + (query ? (uri.search.includes('?') ? '&' : '?') + query : ''),
      method,
      headers     : {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: `text/html; charset=utf-8`,
      },
    };

    if (verbose) {

      log.dump({
        'request.js': rq,
      }, 6);
    }

    var req = lib.request(rq, res => {
      res.setEncoding('utf8');

      let body = '';

      res.on('data', chunk => {

        body += chunk
      });

      res.on('end', () => {

        try {

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          })
        }
        catch (e) {

          if (verbose) {

            log.dump({
              request_resolve_exception_catch: serializeError(e),
            })
          }
          else {

            throw e;
          }
        }
      });
    });

    req.on('socket', function (socket) { // uncomment this to have timeout

      socket.setTimeout(timeout);

      socket.on('timeout', () => { // https://stackoverflow.com/a/9910413

        req.abort();

        reject({
          type: 'timeout',
        })
      });
    });

    req.on('error', e => reject({
      type: 'error',
      error: String(e),
    }));

    if ( typeof opt.json !== 'undefined' ) {

      if (opt.method === 'get') {

        throw th(`opt.json is given but method is still get`);
      }

      req.write(JSON.stringify(opt.json));
    }

    req.end();
  });
}


