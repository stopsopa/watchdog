
const log = require('inspc');

const isObject = require('nlab/isObject');

const probeClass = require('./probeClass');

const promiseall = require('nlab/promiseall');

const se = require('nlab/se');

let init;

let list = {};

let knex;

let es;

let man;

const th = msg => new Error(`probeDriver.js error: ${msg}`);

async function register(db) {

  let cls = probeClass(db);

  await cls.construct();

  list[db.id] = cls;
}

const intreg = /^\d+$/;
async function unregister(id) {

  if ( ! intreg.test(id) ) {

    throw th(`unregister() id don't match ${intreg}, it is: ` + JSON.stringify(id));
  }

  let cls;

  ({
    [id]: cls,
    ...list
  } = list);

  try {

    cls.destruct();
  }
  catch (e) {

    if (e.message !== `Cannot read property 'destruct' of undefined`) {

      log.dump({
        id,
        destructor_error: se(e),
      })
    }
  }
}

const tool = async function (opt = {}) {

  if ( init ) {

    throw th(`it was already initialized`);
  }

  if ( ! isObject(opt) ) {

    throw th(`opt is not an object`);
  }

  if ( typeof opt.es !== 'function' ) {

    throw th(`opt.es is not defined`);
  }

  try {

    const cls = require('./probeClass');

    cls.setup(opt);
  }
  catch (e) {

    log.dump({
      probeClass_contructor_general_error: se(e)
    });

    process.exit(1);
  }

  let list;

  try {

    man = opt.knex.model.probes;

    list = await man.listImportantColumns({
      format: 'list',
    });

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

  var all = [];

  for (let db of list) {

    all.push(async function () {

      // this async is to just run all from list in parallel
      // WARNING: and that's why it must be have it's own try catch for local error handling
      // it should crush server actually because it is used only here with list from db

      let {
        code,
        description,
        ...rest
      } = db;

      try {

        await register(db);
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

  await promiseall(all);

  init = opt;
}

tool.getProbe = (id, _throw = true) => {

  if ( ! intreg.test(id) ) {

    throw th(`getProbe() error: id don't match ${intreg}`);
  }

  if (_throw) {

    if ( ! list[id] ) {

      throw th(`getProbe() error: probe not found by id ${id}`);
    }
  }

  return list[id];
}

tool.getProbes = () => list;

tool.getProbesArray = () => Object.keys(list).map(key => list[key]);

tool.register = db => register(db);

tool.updateById = async (id, trx) => {

  if ( ! Number.isInteger(id) ) {

    throw th(`updateById is is not an integer`);
  }

  unregister(id);

  man = knex.model.probes;

  try {

    const db = await man.findFiltered(trx, id);

    register(db)
  }
  catch (e) {

    log.dump({
      updateById_probeDriver: `Can't reregister by id ${id} - object doesn't exist in database`,
    })
  }
};

tool.unregister = id => unregister(id);

tool.update = db => {

  unregister(db.id);

  register(db)
}

module.exports = tool;