
const path = require('path');

const fs = require('fs');

const log = require('inspc');

const isObject = require('nlab/isObject');

const isDate = require('nlab/isDate');

const delay = require('nlab/delay');

const ms        = require('nlab/ms');

const generate  = ms.generate;

const raw       = ms.raw;

const se = require('nlab/se');

const promiseall = require('nlab/promiseall');

const verbose = process.argv.includes('--verbose')

const groupsDriver = require('./groupsDriver');

const usersDriver = require('./usersDriver');

const th = (msg, data) => {

  const e = new Error(`boxClass.js error: ${msg} `);

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
  //   throw new Error( `Can't create instance of function 'boxClass' just use it as a function` );

  if ( ! isObject(dbNoCode) ) {

    throw th(`data is not an object`, dbNoCode);
  }

  if ( ! Number.isInteger(db.id) ) {

    throw th(`data.id is not an integer`, dbNoCode);
  }

  db = Object.assign({}, db);

  delete db.description;

  const cls = {
    destruct: function (opt = {}) {

      const {
        hide_log,
      } = opt || {};

      hide_log || (log.t(`box destruct  ${db.enabled ? 'enabled ' : 'disabled'} [${String(db.id).padStart(6, ' ')}]`));
    },
    construct: async function () {

      log.t(`box  construct ${db.enabled ? 'enabled ' : 'disabled'} [${String(db.id).padStart(6, ' ')}]`);

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
    },
    getUsers: function () {

      let ids = [];

      db.groups
        .filter(g => g.enabled === true)
        .map(g => {

          const group = groupsDriver.getGroup(g.id, false);

          if (group) {

            return group.users;
          }
        })
        .filter(Boolean)
        .map(u => {
          ids = ids.concat(u);
        })
      ;

      ids = ids.concat(db.users.filter(u => u.enabled === true).map(u => u.id));

      ids = [...new Set(ids)];

      return ids.reduce((acc, id) => {
        const user = usersDriver.getUser(id, false);
        user && acc.push(user);
        return acc;
      }, []);
    },
    getDb: function () {
      return db;
    },
    isName: function (name) {
      return db.box === name;
    },
    toJSON: function () {
      return {cls:'boxClass', ...dbNoCode};
    },
    endpoint: async function (req) {

      let password = req.body.password;

      if ( ! password ) {

        password = req.query.password;
      }

      if ( ! password ) {

        password = req.headers['x-password'];
      }

      if ( typeof password !== 'string' ) {

        throw th(`endpoint(): password is not defined`);
      }

      password = password.trim();

      if ( ! password ) {

        throw th(`endpoint(): password is an empty string`);
      }

      const data = {
        query: {},
        body: {},
      };

      if (isObject(req.query)) {

        data.query = {...req.query};
      }

      if (isObject(req.body)) {

        data.body = {...req.body};
      }

      delete data.query.password;

      delete data.body.password;

      // log.dump({
      //   password,
      //   data,
      //   db,
      // }, 10)

      if ( db.password !== password ) {

        throw th(`endpoint(): db.password !== password`);
      }

      let created = new Date();

      let body = {
        messenger_id  : db.id,
        created,
        data,
      };

      let esid = undefined;

      if (db.enabled) {

        try {

          ({
            esid,
            body,
          } = await this.sent({...body}));
        }
        catch (e) {

          // insert just before thorow
          // because it is important to save it but
          // also handle it as an error because there was an error during sending message

          ({
            esid,
            body,
          } = await this.index({...body}));

          throw e;
        }
      }
      else {

        ({
          esid,
          body,
        } = await this.index({...body}));
      }

      return {
        esid,
        body,
      }
    },
    /**
     * If esid provided this method will update es document in es
     * if not provided then insert
     */
    sent: async function ({
      esid,
      ...body
    }) {

      if ( ! isObject(body) || Object.keys(body).length === 0 ) {

        if ( esid ) {

          body = await this.find(esid);
        }
        else {

          throw th(`sent() body is not an object and esid is not provided`);
        }
      }

      if ( ! isObject(body) || Object.keys(body).length === 0 ) {

        throw th(`sent() body is not an object or it is an empty object`);
      }

      const users = await this.getUsers();

      const log = [];

      let status = 'sent';

      for ( let user of users ) {

        const udb = user.toJSON();

        log.dump({
          udb,
        }, 10);

        const data = {id: udb.id};

        // telegram
        await (async function () {

          const config = udb.config.telegram;

          if (config && config.id) {

            try {

              data.telegram_sent = config.id;
            }
            catch (e) {

              // if catch then change status to error !!! IT'S MANDATORY
              status = 'errors';

              data.telegram_error = String(e);
            }
          }
        }());

        log.push(data);
      }

      body.log      = log;

      body.sent     = new Date();

      body.status   = status;

      ({
        esid,
        body,
      } = await this.index(body, esid));

      return {
        esid,
        body,
      }
    },
    index: async function (body, esid) {

      // this will change in place
      if ( ! /^(sent|errors)$/.test(body.status) ) {

        body.status = 'suspended';
      }

      const esresult = await es(
        `/${index}/_doc/${esid || ''}`,
        {
          method: esid ? 'PUT': 'POST',
          body: (function (body) {

            // those are changes made just for insert purposes
            // deliberately on copy in closure

            if (isDate(body.created)) {

              body.created = body.created.toISOString();
            }

            if (isDate(body.sent)) {

              body.sent = body.sent.toISOString();
            }

            return body;
          }({...body})),
        }
      );

      if ( ! Number.isInteger(esresult.status) || (esresult.status < 200 || esresult.status > 299)) {

        log.dump({
          messenger_id: db.id,
          method: esid ? 'PUT': 'POST',
          esid,
          index_es_status_error: esresult,
        }, 10)

        throw th(`es index error`);
      }

      // log.dump({
      //   method: esid ? 'PUT': 'POST',
      //   esid,
      //   esresult
      // }, 10)

      if ( ! esid ) {

        try {

          if (typeof esresult.body._id === 'string') {

            esid = esresult.body._id;
          }
        }
        catch (e) {}
      }

      return {
        esid,
        body,
      };
    },
    find: async function (esid) {

      if ( verbose ) {

        await delay(2000);
      }

      // GET my-index-000001/_search
      // {
      //   "query": {
      //   "terms": {
      //     "_id": [ "1", "2" ]
      //   }
      // }
      // }

      if ( typeof esid !== 'string') {

        throw th(`find(): esid is not a string`);
      }

      const response = await es(`/${index}/_search`, {
        body: {
          "query": { "term" : {"_id" : esid} },
          "size": 1
        }
      });

      if ( response.status !== 200 ) {

        throw th(`find() response.status is not 200`);
      }

      try {

        if ( response.body.hits.hits[0]._id === esid ) {

          if ( typeof response.body.hits.hits[0]._source.created === 'string') {

            response.body.hits.hits[0]._source.created = new Date(response.body.hits.hits[0]._source.created);

            return response.body.hits.hits[0]._source;
          }
        }
      }
      catch (e) {

        throw th(`Can't extract response.body.hits.hits[0]._id for esid: (${esid}), raw error: ${e}`);
      }
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

  index = es.prefix('messengers');
}

module.exports = tool;


