
const URL           = require('url').URL;

const se            = require('nlab/se');

const promiseall    = require('nlab/promiseall');

const emsg          = msg => `probe-active: ${msg}`;

const th            = msg => new Error(emsg(msg));

// to see how it works https://github.com/stopsopa/watchdog/blob/master/app/lib/jsonfetch.js
const jsonfetch     = require('./app/lib/jsonfetch');

module.exports = async function ({
  PROTOCOL, // http || https
  HOST,     // domain.com || localhost || 0.0.0.0
  PORT,     // ':80' || ':8080' || '' - empty string only if (PROTOCOL == 'http' && PORT == 80) || (PROTOCOL == 'https' && PORT == 443)
trigger, // normally undefined but it can have value 'nextTriggerFromNowMilliseconds > 1000'
}) {

  try {

    const t = time();

    const data = await jsonfetch(`${PROTOCOL}://${HOST}${PORT}`, {
      nobody: true,
    });

    t(1000);

    // const common    = 'lymphomahub.com/__ping';
    //
    // const expected  = `https://${common}`;
    //
    // let [
    //   resWWW,
    //   resHttp,
    // ] = await promiseall([
    //   jsonfetch(`https://www.${common}`, {
    //     nobody: true,
    //   }),
    //   jsonfetch(`http://${common}`, {
    //     nobody: true,
    //   }),
    // ]);

    return { // this object should have only two keys: 'probe' and 'data' (where data is optional)

      // This is the only field used to determine if probe passed the test,
      // rest of data in object goes straight to the elasticsearch logs as it is.

      // Try to don't put too much data there - be reasonable

      // Driver responsible for running this code will check if it returns an object
      // and if the object have 'probe' key with boolean type value.
      // Any deviation from those conditions will cause driver to throw "Invalid probe error'.
      probe: data.status === 200,
      ...data

      // probe: resWWW.status === 308 && resHttp.status === 308 && resWWW.headers.location === expected && resHttp.headers.location === expected,
      // resWWW,
      // resHttp,
    }

  }
  catch (e) {

    e = se(e);

    if (typeof e === 'string') {

      e = {
        error: e,
      }
    }

    // remember also to properly handle any potential errors

    return {
      probe: false, // still "probe" key with boolean value type is required
      ...e,
    }
  }
}

function time() {
  const t = new Date();
  return timeout => {
    const tt = (new Date()).getTime() - t.getTime();
    if (tt > timeout) {
      throw new Error(`timeout error: should take not more than ${timeout}ms but took ${tt}ms`);
    }
  }
};
