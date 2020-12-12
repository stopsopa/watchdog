
const path = require('path');

const fs = require('fs');

const logg = require('inspc');

const isObject = require('nlab/isObject');

const ms        = require('nlab/ms');

const generate  = ms.generate;

const raw       = ms.raw;

const se = require('nlab/se');

const promiseall = require('nlab/promiseall');

const verbose = process.argv.includes('--verbose')

const th = (msg, data) => {

  const e = new Error(`userClass.js error: ${msg} `);

  if (data) {

    e.details = data;
  }

  return e;
};

let port = (function (PORT, PROTOCOL) {

  let port = parseInt(PORT, 10);

  if (Number.isInteger(port) && port > 0) {

    if (PROTOCOL  === 'https' && port !== 443) {

      return `:${port}`;
    }

    if (PROTOCOL === 'http' && port !== 80) {

      return `:${port}`;
    }
  }

  return '';

}(process.env.PORT, process.env.PROTOCOL));

const int_regex = /^\d+$/;

let es;

let io;

let index;

function tool(db) {

  const {
    description,
    ...dbNoCode
  } = db;

  // if ( this instanceof tool )
  //   throw new Error( `Can't create instance of function 'userClass' just use it as a function` );

  if ( ! isObject(dbNoCode) ) {

    throw th(`data is not an object`, dbNoCode);
  }

  if ( ! Number.isInteger(db.id) ) {

    throw th(`data.id is not an integer`, dbNoCode);
  }

  db = Object.assign(Object.create(null), db);

  const cls = {
    destruct: function (opt = {}) {

      const {
        hide_log,
      } = opt || {};

      hide_log || (logg.t(`user destruct  ${db.enabled ? 'enabled ' : 'disabled'} [${String(db.id).padStart(6, ' ')}]`));
    },
    construct: async function () {

      logg.t(`user construct ${db.enabled ? 'enabled ' : 'disabled'} [${String(db.id).padStart(6, ' ')}]`);

      this.destruct({
        hide_log: true,
      });
    },
    findLastLog: async function (box_id) {

      if ( ! int_regex.test(box_id) ) {

        throw th(`findLastLog() box_id don't match ${box_id}`);
      }

      const response = await es(`/${index}/_search`, {
        body: {
          "query": { "term" : {"box_id" : box_id} },
          "sort": { "created": { "order": "desc" } },
          "size": 1
        }
      });

      if ( response.status !== 200 ) {

        throw th(`findLastLog() response.status is not 200`);
      }

      return response.body;
    }
  }

  return cls;
}

tool.setup = function (opt) {

  if ( ! isObject(opt) ) {

    throw th(`setup() opt is not an object`);
  }

  ({
    es,
    io
  } = opt);

  if (typeof es !== 'function' ) {

    throw th(`setup() es is not defined`);
  }

  if ( !isObject(io)) {

    throw th(`setup() io is not an object`);
  }

  index = es.prefix('users');
}

module.exports = tool;


