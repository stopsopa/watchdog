
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

    list = await man.fetch(`select * from :table:`);

    log.dump({
      list_all_probes: list.map(r => {

        const {
          code,
          ...rest
        } = r;

        return rest;
      })
    })

  } catch (e) {

    throw th(`couldn't fetch probes from db: ${e}`);
  }


  for (let d of list) {

    (async function () { // this async is to just run all from list in parallel

      let {
        code,
        ...rest
      } = d;

      let tmp = probeClass(d);

      try {

        await tmp.construct(true);
      }
      catch (e) {

        log.dump({
          general_error_running_probe: se(e),
          context: rest,
        }, 4)

        process.exit(1);
      }
    }());
  }






  init = opt;


}



module.exports = tool;