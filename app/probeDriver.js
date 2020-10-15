
const log = require('inspc');

const probeClass = require('./probeClass');

const se = require('nlab/se');

let init;

let probes = {};

let man;

const th = msg => new Error(`probeDriver.js error: ${msg}`);

const tool = async function (opt = {}) {

  let list;

  if ( typeof opt.es !== 'function' ) {

    throw th(`opt.es is not defined`);
  }

  try {

    man = opt.knex.model.probes;

    list = await man.query(`select * from :table:`);

  } catch (e) {

    throw th(`couldn't fetch probes from db: ${e}`);
  }

  // log.dump({
  //   list: list.map(({ code, ...rest }) => rest),
  // })

  for (let d of list) {

    try {

      let {
        code,
        ...rest
      } = d;

      let tmp = probeClass(d);

      (async function (rest) {

        try {

          await tmp.construct();
        }
        catch (e) {

          log.dump({
            general_error_running_probe: se(e),
            context: rest,
          }, 4)

          process.exit(1);
        }
      }(rest));
    }
    catch (e) {

      log.dump({
        general_error: se(e),
        context: rest,
      }, 4)

      process.exit(1);
    }
  }






  init = opt;


}



module.exports = tool;