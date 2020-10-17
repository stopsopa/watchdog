
const log = require('inspc');

const isObject = require('nlab/isObject');

const probeClass = require('./probeClass');

const se = require('nlab/se');

let init;

let probes = {};

let knex;

let es;

let man;

const th = msg => new Error(`probeDriver.js error: ${msg}`);

const tool = async function (opt = {}) {

  if ( ! isObject(opt) ) {

    throw th(`opt is not an object`);
  }

  if ( typeof opt.es !== 'function' ) {

    throw th(`opt.es is not defined`);
  }

  let list;

  try {

    man = opt.knex.model.probes;

    list = await man.fetch(`select * from :table:`);

    // log.dump({
    //   list_all_probes: list.map(r => {
    //
    //     const {
    //       code,
    //       ...rest
    //     } = r;
    //
    //     return rest;
    //   })
    // })

  } catch (e) {

    throw th(`couldn't fetch probes from db: ${e}`);
  }

  ({
    knex,
    es
  } = opt);

  for (let db of list) {

    (async function () {

      // this async is to just run all from list in parallel
      // WARNING: and that's why it must be have it's own try catch for local error handling
      // it should crush server actually because it is used only here with list from db

      let {
        code,
        ...rest
      } = db;

      try {

        let cls = probeClass(db);

        await cls.construct(true);

        probes[rest.id] = cls;
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