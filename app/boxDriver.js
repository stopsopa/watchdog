
const log = require('inspc');

const isObject = require('nlab/isObject');

const boxClass = require('./boxClass');

const promiseall = require('nlab/promiseall');

const se = require('nlab/se');

const groupsDriver = require('./groupsDriver');

const usersDriver = require('./usersDriver');

let init;

let list = {};

let knex;

let es;

let man;

const th = msg => new Error(`boxDriver.js error: ${msg}`);

async function register(db) {

  let cls = boxClass(db);

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

    log.dump({
      id,
      destructor_error: se(e),
    }, 4)
  }
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

  try {

    const cls = require('./boxClass');

    cls.setup(opt);
  }
  catch (e) {

    log.dump({
      boxClass_contructor_general_error: se(e)
    });

    process.exit(1);
  }

  try {

    await groupsDriver(opt);
  }
  catch (e) {

    log.dump({
      groupsDriver_contructor_general_error: se(e)
    });

    process.exit(1);
  }

  try {

    await usersDriver(opt);
  }
  catch (e) {

    log.dump({
      usersDriver_contructor_general_error: se(e)
    });

    process.exit(1);
  }

  try {

    const cls = require('./userClass');

    cls.setup(opt);
  }
  catch (e) {

    log.dump({
      userClass_contructor_general_error: se(e)
    });

    process.exit(1);
  }

  let list;

  try {

    man = opt.knex.model.postbox;

    list = await man.listImportantColumns({
      format: 'list',
    });

  } catch (e) {

    throw th(`couldn't fetch boxes from db: ${e}`);
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
          general_error_running_box: se(e),
          context: rest,
        }, 4)

        process.exit(1);
      }
    }());
  }

  await promiseall(all);

  init = opt;

  if (process.env.TEST_MODE === 'true') {

    opt.app.all('/boxDriver', (req, res) => {
      res.set('Content-type', 'text/html; charset=utf-8')
      return res.end(`
<ul>
<li><a href="/boxDriver">/boxDriver</a></li>
<li><a href="/groupsDriver">/groupsDriver</a></li>
<li><a href="/usersDriver">/usersDriver</a></li>
</ul>
<pre>${JSON.stringify(tool.getBoxesArray(), null, 4)}</pre>      
`);
    });
  }
}

tool.getBox = (id, _throw = true) => {

  if ( ! intreg.test(id) ) {

    throw th(`getBox() error: id don't match ${intreg}`);
  }

  if (_throw) {

    if ( ! list[id] ) {

      throw th(`getBox() error: probe not found by id ${id}`);
    }
  }

  return list[id];
}

tool.getBoxes = () => list;

tool.getBoxesArray = () => Object.keys(list).map(key => list[key]);

tool.register = db => register(db);

tool.unregister = id => unregister(id);

tool.update = db => {

  unregister(db.id);

  register(db)
}

module.exports = tool;