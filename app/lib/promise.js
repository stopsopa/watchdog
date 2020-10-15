
const log           = require('inspc');

const request       = require('./request');

const th = msg => new Error(`promise.js error: ${msg}`);

const se = require('nlab/se');

module.exports = function (url, opt = {}) {

  const {
    // timeout = 500,
    verbose = true,
  } = opt;

  if ( typeof url !== 'string' ) {

    throw th(`url is not a string`)
  }

  if ( ! /^https?:\/\//.test(url) ) {

    throw th(`url is an empty string`)
  }

  let resolve, reject;

  const promise = new Promise((r, j) => {resolve = r, reject = j});

  let attempts = 7;

  let i = 0;

  (async function run() {

    try {

      const response = await request(url, opt);

      if (response.status == 200 && response.body && response.body.pressure && response.body.pressure.isAvailable) {

        if ( verbose ) {

          log.dump({
            success: response,
          }, 4);
        }

        return resolve();
      }
    }
    catch (e) {

      if ( verbose ) {

        log.dump({
          request_error: se(e)
        })
      }
    }

    if (i < attempts) {

      setTimeout(run, 700);

      if ( verbose ) {

        console.log(`============= still waiting ===== ${i} from ${attempts}`);
      }
    }
    else {

      reject(`${attempts} attempts to call ${url} failed, server can't start`);
    }

    i += 1;
  }());

  return promise;
}