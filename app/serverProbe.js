
const path = require('path');

const fs = require('fs');

const mkdirp = require('mkdirp');

const isObject = require('nlab/isObject');

const {serializeError, deserializeError} = require('serialize-error');

const th = (msg, data) => {

  const e = new Error(`serverProbe.js error: ${msg} `);

  if (typeof e.stack === 'string') {

    e.stack = e.stack.split("\n")
  }

  if (data) {

    e.details = data;
  }

  return e;
};

const type_regex = /^(active|passive)$/;

let _dir;

function tool(db) {

  if ( typeof _dir !== 'string' ) {

    throw th(`_dir is undefined - first use setup method`);
  }

  // if ( this instanceof tool )
  //   throw new Error( `Can't create instance of function 'serverProbe' just use it as a function` );

  if ( !isObject(db) ) {

    throw th(`data is not an object`, db);
  }

  if ( ! Number.isInteger(db.id) ) {

    throw th(`data.id is not an integer`, db);
  }

  if ( ! type_regex.test(db.type) ) {

    throw th(`data.type don't match '${type_regex}'`, db);
  }

  if ( ! (db.code === null || typeof db.code === 'string') ) {

    throw th(`data.code should be null or string`, db);
  }

  db = Object.assign({}, db);

  return {
    evaluateFunction: function () {

      const file = path.resolve(_dir, `probe_${db.id}.js`);

      if ( fs.existsSync(file) ) {

        fs.unlinkSync(file);
      }

      if ( fs.existsSync(file) ) {

        throw th(`Can't remove file '${file}'`);
      }

      fs.writeFileSync(file, db.code);

      let tmp;

      try {

        delete require.cache[file];

        tmp = require(file);
      }
      catch (e) {

        delete require.cache[file];

        e = serializeError(e);

        if (typeof e.stack === 'string') {

          e.stack = e.stack.split("\n")
        }

        const err = th(`couldn't import file '${file}'`);

        err.details = e;

        throw err;
      }

      delete require.cache[file];

      const type = typeof tmp;

      if ( type !== 'function' ) {

        throw th(`module declared in file '${file}' should return function but it has returned '${type}'`);
      }

      // I could also check number of arguments that function accept but at the moment I'm not sure how many ...

      return tmp;
    },
    testRun: async function () {

      let data;

      try {

        const lib = await this.evaluateFunction();

        data = await lib();

        if ( ! isObject(data) ) {

          throw new Error(`testRun error: module when executed should return object, it returned '${typeof data}'`);
        }

        if ( typeof data.probe !== 'boolean' ) {

          throw new Error(`testRun error: object returned from module after execution should contain 'probe' key with value of type 'boolean' but returned value type is '${typeof data.probe}'`);
        }

        return {
          status: 'working',
          data,
        }
      }
      catch (e) {

        e = serializeError(e);

        if (typeof e.stack === 'string') {

          e.stack = e.stack.split("\n")
        }

        return {
          status: 'crashed',
          data: {
            exception: e,
            data,
          },
        }
      }
    }
  }
}

tool.setup = function ({
  dir,
}) {
  _dir = dir;

  if ( ! fs.existsSync(_dir) ) {

    mkdirp.sync(_dir);
  }

  if ( ! fs.existsSync(_dir) ) {

    throw th(`can't create directory '${_dir}'`);
  }

  const file = path.resolve(_dir, '___xxx.txt');

  if ( fs.existsSync(file) ) {

    fs.unlinkSync(file);
  }

  if ( fs.existsSync(file) ) {

    throw th(`Can't remove file '${file}' 1`);
  }

  fs.writeFileSync(file, '');

  if ( ! fs.existsSync(file) ) {

    throw th(`Can't create file '${file}'`);
  }

  fs.unlinkSync(file);

  if ( fs.existsSync(file) ) {

    throw th(`Can't remove file '${file}' 2`);
  }
}

module.exports = tool;


