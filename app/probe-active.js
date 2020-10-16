
const URL           = require('url').URL;

const https         = require('https');

const http          = require('http');

const querystring   = require('querystring');

const isObject      = require('nlab/isObject');

const log           = require('inspc');

const se            = require('nlab/se');

const emsg          = msg => `jsonfetch: ${msg}`;

const th            = msg => new Error(emsg(msg));

module.exports = async function () {

  try {

    const data = await jsonfetch('http://example.com/');

    delete data.body; // to reduce log size

    return { // this object should have only two keys: 'probe' and 'data' (where data is optional)

      // This is the only field used to determine if probe passed the test,
      // rest of data in object goes straight to the elasticsearch logs as it is.

      // Try to don't put too much data there - be reasonable

      // Driver responsible for running this code will check if it returns an object
      // and if the object have 'probe' key with boolean type value.
      // Any deviation from those conditions will cause driver to throw "Invalid probe error'.
      probe: data.status === 200,
      ...data
    }

  }
  catch (e) {

    // remember also to properly handle any potential errors

    return {
      probe: false, // still "probe" key with boolean value type is required

      // if it reached catch then try to use always 'catch' key in es
      // to store catch error messages the same way for general consistancy of future queries,
      // to be able filter out all results that falled into catch for example
      catch: se(e), // Casting exception to string (which will happen implicitly) is not extracting all available data from it, use se()
      // you can add something extra keys/data here
    }
  }
}

function jsonfetch (url, opt = {}) {

  let {
    method      = 'GET',
    timeout     = 30 * 1000,
    get         = {},
    headers     = {},
    debug       = false,
    body,
  } = opt;

  if ( typeof method !== 'string' ) {

    throw th(`method is not a string`);
  }

  method = method.toLowerCase();

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

        resolve({
          status: res.statusCode,
          headers: res.headers,
          body,
        })
      });
    });

    req.on('socket', function (socket) { // uncomment this to have timeout

      socket.setTimeout(timeout);

      socket.on('timeout', () => { // https://stackoverflow.com/a/9910413/5560682

        req.abort();

        reject(emsg(`timeout`))
      });
    });

    req.on('error', e => reject(emsg(`on error: ${e}`)));

    body && req.write(body);

    req.end();
  });
}
