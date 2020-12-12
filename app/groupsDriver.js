
const log = require('inspc');

const isObject = require('nlab/isObject');

const promiseall = require('nlab/promiseall');

const se = require('nlab/se');

let init;

let list = {};

let knex;

let es;

let man;

const th = msg => new Error(`groupsDriver.js error: ${msg}`);

async function register(db) {

  list[db.id] = db;
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
}

const tool = async function (opt = {}) {

  if ( init ) {

    throw th(`it was already initialized`);
  }

  if ( ! isObject(opt) ) {

    throw th(`opt is not an object`);
  }

  if ( typeof opt.app !== 'function' ) {

    throw th(`opt.app is not a function`);
  }

  if ( typeof opt.app.use !== 'function' ) {

    throw th(`opt.app.use is not a function`);
  }

  if ( typeof opt.es !== 'function' ) {

    throw th(`opt.es is not defined`);
  }

  let list;

  try {

    man = opt.knex.model.groups;

    list = await man.listImportantColumns({
      format: 'list',
    });

  } catch (e) {

    throw th(`couldn't fetch group from db: ${e}`);
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
        description,
        ...rest
      } = db;

      try {

        await register(db);
      }
      catch (e) {

        log.dump({
          general_error_running_users: se(e),
          context: rest,
        }, 4)

        process.exit(1);
      }
    }());
  }

  await promiseall(all);

  init = opt;

  if (process.env.TEST_MODE === 'true') {

    opt.app.all('/groupsDriver', (req, res) => {
      res.set('Content-type', 'text/html; charset=utf-8')
      return res.end(`
<ul>
<li><a href="/boxDriver">/boxDriver</a></li>
<li><a href="/groupsDriver">/groupsDriver</a></li>
<li><a href="/usersDriver">/usersDriver</a></li>
</ul>
<pre>${JSON.stringify(tool.getGroupsArray(), null, 4)}</pre>      
`);
    });
  }
}

tool.getGroup = (id, _throw = true) => {

  if ( ! intreg.test(id) ) {

    throw th(`getGroup() error: id don't match ${intreg}`);
  }

  if (_throw) {

    if ( ! list[id] ) {

      throw th(`getGroup() error: probe not found by id ${id}`);
    }
  }

  return list[id];
}

tool.getGroups = () => list;

tool.getGroupsArray = () => Object.keys(list).map(key => list[key]);

tool.register = db => register(db);

tool.updateById = async (id, trx) => {

  if ( ! Number.isInteger(id) ) {

    throw th(`updateById is is not an integer`);
  }

  unregister(id);

  man = knex.model.groups;

  try {

    const db = await man.findFiltered(trx, id);

    register(db)
  }
  catch (e) {

    log.dump({
      updateById_groupsDriver: `Can't reregister by id ${id} - object doesn't exist in database`,
    })
  }
};

tool.unregister = id => unregister(id);

tool.update = db => {

  unregister(db.id);

  register(db)
}

module.exports = tool;