
/*

usage in server script:

require('dotenv-up')({
  override    : false,
  deep        : 5,
}, false, '..................');

(function () {

  const atomclock = require('./app/lib/atomclock');

  atomclock.crashServer();
}());

*/

const log = require('inspc');

const jsonfetch = require('./jsonfetch');

const promiseany = require('nlab/promiseany');

// const promiseall = require('nlab/promiseall');

const emsg = msg => `atomclock.js error: ${msg}`

const th = msg => new Error(emsg(msg));

// module.exports = (warning = true) => promiseall([
const tool = (warning = true) => promiseany([
  async atom => {

    try {

      atom = await jsonfetch('http://worldtimeapi.org/api/timezone/Etc/UTC', {
        timeout: 2000,
      });

      if ( ! Number.isInteger(atom.body.unixtime) ) {

        throw th(`http://worldtimeapi.org/api/timezone/Etc/UTC unixtime is not an integer`);
      }

      return atom.body.unixtime;

    }
    catch (e) {

      if (warning) {

        log.dump({
          atomclick_js_warning: e
        })
      }

      throw e;
    }
  },
  async atom => {

    try {

      atom = await jsonfetch('http://showcase.api.linx.twenty57.net/UnixTime/tounixtimestamp?datetime=now', {
        timeout: 2000,
      });

      if (atom.status !== 200) {

        throw th(`http://showcase.api.linx.twenty57.net/UnixTime/tounixtimestamp?datetime=now atom.status !== 200`);
      }

      if ( ! /^\d+$/.test(atom.body.UnixTimeStamp) ) {

        throw th(`http://showcase.api.linx.twenty57.net/UnixTime/tounixtimestamp?datetime=now atom.body.UnixTimeStamp don't match /^\\d+$/`);
      }

      atom = parseInt(atom.body.UnixTimeStamp, 10);

      if ( ! Number.isInteger(atom) ) {

        throw th(`http://showcase.api.linx.twenty57.net/UnixTime/tounixtimestamp?datetime=now atom is not an integer`);
      }

      return atom;

    }
    catch (e) {

      if (warning) {

        log.dump({
          atomclick_js_warning: e
        })
      }

      throw e;
    }
  },
  async atom => {

    try {

      atom = await jsonfetch('http://widget.time.is/', {
        timeout: 2000,
      });

      if (atom.status !== 200) {

        throw th(`http://worldclockapi.com/api/json/utc/now atom.status !== 200`);
      }

      atom = atom.body.replace(/^[^\d]+(\d+).*$/, '$1');

      if ( ! /^\d+$/.test(atom) ) {

        throw th(`http://worldclockapi.com/api/json/utc/now atom.status don't match /^\\d+$/`);
      }

      return parseInt(parseInt(atom, 10) / 1000, 10);

    }
    catch (e) {

      if (warning) {

        log.dump({
          atomclick_js_warning: e
        })
      }

      throw e;
    }
  },
]);

tool.crashServer = async function () {

  try {

    if ( ! /^\d+$/.test(process.env.PROTECTED_MYSQL_MAX_TIME_DIFF || '') ) {

      console.log(`atomclock.js process.env.PROTECTED_MYSQL_MAX_TIME_DIFF (value: '${process.env.PROTECTED_MYSQL_MAX_TIME_DIFF}') is not defined or it doesn't match /^\\d+$/`);

      process.exit(1);
    }

    const crushnodeifdiffgreaterthansec = parseInt(process.env.PROTECTED_MYSQL_MAX_TIME_DIFF, 10);

    const at = await tool(false);

    const now = parseInt((new Date()).getTime() / 1000, 10)

    const abs = Math.abs(at - now);

    if (abs > crushnodeifdiffgreaterthansec) {

      throw new Error(`atomclock.js time - node UTC time differance '${abs}' is greater than '${crushnodeifdiffgreaterthansec}' sec`);
    }

    console.log(`Time differance between atomclock.js time and node.js clock time is '${abs}', should be smaller than ${crushnodeifdiffgreaterthansec}`)

    console.log("Time diff is small enough 👍")

  }
  catch (e) {

    log.dump({
      atomclick_general_error: e
    })

    process.exit(1)
  }
}

module.exports = tool;