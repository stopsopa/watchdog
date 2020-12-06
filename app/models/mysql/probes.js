
const abstract          = require('knex-abstract');

const extend            = abstract.extend;

const prototype         = abstract.prototype;

const log               = require('inspc');

const fs                = require('fs');

const path              = require('path');

const a                 = prototype.a;

const isObject          = require('nlab/isObject');

const se = require('nlab/se');

const probeClass       = require('../../probeClass');

const ms                = require('nlab/ms');

const generate          = ms.generate;

const validator         = eval('require')('@stopsopa/validator');

const {
    Required,
    Optional,
    Collection,
    All,
    Blank,
    Callback,
    Choice,
    Count,
    Email,
    IsFalse,
    IsNull,
    IsTrue,
    Length,
    NotBlank,
    NotNull,
    Regex,
    Type,
} = validator;

const table             = 'probes';

const id                = 'id';

const def = {
    active  : fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'probe-active.js'), 'utf8').toString(),
    passive : fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'probe-passive.js'), 'utf8').toString(),
}

module.exports = knex => extend(knex, prototype, {
    initialize: async function (extra) {

//         const id = await this.raw(`
// select r.id from roles r where r.name = ?
// `, ['user']).then(role => {
//             try {
//                 return role[0][0].id;
//             }
//             catch (e) {
//
//             }
//         });
//
//         const roles = [];
//
//         if (id) {
//
//             roles.push(id);
//         }

        return {
            name: '',
            interval_ms: generate({
                m: 1
            }),
            enabled: false,
            detailed_log: false,
            service_mode: false,
            code: def[extra.type],
            ...extra,
        }
    },
    fromDb: async function (row, opt, trx) {

        if ( ! isObject(row) ) {

            return row;
        }

        // if (typeof row.roles === 'string') {
        //
        //     row.roles = row.roles.split(',').map(r => /^\d+$/.test(r) ? parseInt(r, 10) : r).filter(Boolean);
        // }
        //
        // if (typeof row.rnames === 'string') {
        //
        //     row.rnames = row.rnames.split(',').filter(Boolean);
        // }
        //
        // if ( ! Array.isArray(row.roles) ) {
        //
        //     row.roles = [];
        // }
        //

        row.enabled = Boolean(row.enabled);

        row.detailed_log = Boolean(row.detailed_log);

        row.service_mode = Boolean(row.service_mode);
        //
        // if (typeof row.config === 'string') {
        //
        //     try {
        //
        //         row.config = JSON.parse(row.config);
        //     }
        //     catch (e) {
        //
        //         row.config = {};
        //     }
        // }

        return row;
    },
    toDb: async function (row, opt, trx) {

        if ( ! isObject(row) ) {

            return row;
        }

        row.enabled = Boolean(row.enabled);

        row.detailed_log = Boolean(row.detailed_log);

        row.service_mode = Boolean(row.service_mode);

        // if (typeof row.roles !== 'undefined') {
        //
        //     delete row.roles;
        // }
        //
        // if (typeof row.created !== 'undefined') {
        //
        //     delete row.created;
        // }
        //
        // if (typeof row.updated !== 'undefined') {
        //
        //     delete row.updated;
        // }
        //
        // if (!row.config) {
        //
        //     delete row.config;
        // }
        //
        // if (typeof row.config !== 'undefined' && typeof row.config !== 'string') {
        //
        //     row.config = JSON.stringify(row.config, null, 4);
        // }

        return row;
    },
    update: function (...args) {

        let [debug, trx, entity, id] = a(args);

        // if (Array.isArray(entity.roles)) {
        //
        //     this.updateRoles(id, entity.roles)
        // }

        return prototype.prototype.update.call(this, debug, trx, entity, id);
    },
    insert: async function (...args) {

        let [debug, trx, entity] = a(args);

        // let roles = null;
        //
        // if (Array.isArray(entity.roles)) {
        //
        //     roles = entity.roles;
        // }
        //
        // entity = this.toDb(Object.assign({}, entity));

        const id = await prototype.prototype.insert.call(this, debug, trx, entity);

        // if (roles) {
        //
        //     await this.updateRoles(id, roles);
        // }

        return id;
    },
    delete: async function (id, ...args) {

        // await this.clearRoles(id);

        return await prototype.prototype.delete.call(this, id, ...args);
    },
//     find: function (...args) {
//
//         let [debug, trx, id] = a(args);
//
//         if ( ! id ) {
//
//             throw `user.js::find(): id not specified or invalid`;
//         }
//
//         const query = `
// SELECT          u.*, GROUP_CONCAT(r.id) roles
// FROM            users u
// LEFT JOIN       user_role ur
// 		     ON ur.user_id = u.id
// LEFT JOIN       roles r
// 		     ON ur.role_id = r.id
// WHERE           u.id = :id
// GROUP BY        u.id
// ORDER BY        id desc
//         `;
//
//         const params = {id};
//
//         return this.raw(debug, trx, query, params).then(data => {
//             // log.dump({
//             //     query,
//             //     params,
//             //     data: data[0][0]
//             // })
//             return data[0][0];
//         }).then(this.fromDb);
//     },
//     findAll: function (...args) {
//
//         let [debug, trx] = a(args);
//
//         return this.raw(debug, trx, `
// SELECT          u.*, GROUP_CONCAT(r.id) roles, GROUP_CONCAT(r.name) rnames
// FROM            users u
// LEFT JOIN       user_role ur
// 		     ON ur.user_id = u.id
// LEFT JOIN       roles r
// 		     ON ur.role_id = r.id
// GROUP BY        u.id
// ORDER BY        id desc
//         `).then(data => {
//             return data[0];
//         }).then(list => Promise.all(list.map(l => this.fromDb(l))));
//     },
    prepareToValidate: function (data = {}, mode) {

        // if (typeof data.id !== 'undefined') {
        //
        //     delete data.id;
        // }

        delete data.created;

        delete data.updated;

        return data;
    },
    getValidators: function (mode, id, entityPrepared) {

        const collection = {
            id: new Optional(),
            name: new Required([
                new NotBlank(),
                new Length({max: 255}),
            ]),
            description: new Optional(),
            password: new Optional(),
            type: new Choice(['active', 'passive']),
            code: new Required([
                new Type('str'),
                new Callback(
                  (value, context, path, extra) =>
                    new Promise((resolve, reject) => {

                        if ( typeof value === 'string') {

                            const {
                                type,
                            } = context.rootData;

                            if ( /^(active|passive)$/.test(type) ) {

                                let validationError = false;

                                try {

                                    const tool = probeClass({
                                        id: 0,
                                        code: value,
                                        type,
                                    });

                                    tool.evaluateFunction();
                                }
                                catch (e) {

                                    validationError = JSON.stringify(se(e), null, 4)
                                }

                                if ( validationError ) {

                                    context
                                      .buildViolation(`Evaluating failed: {{ error }}.`)
                                      .atPath(path)
                                      .setParameter('{{ error }}', validationError)
                                      .setCode("CALLBACK_5")
                                      .setInvalidValue(value)
                                      .addViolation()
                                    ;

                                    if (extra && extra.stop) {

                                        return reject('reject Callback_5');
                                    }
                                }
                            }
                        }

                        return resolve('resolve Callback_5');
                    })
                ),
            ]),
            enabled: new Required([
                new Type('bool'),
            ]),
            detailed_log: new Required([
                new Type('bool'),
            ]),
            service_mode: new Required([
                new Type('bool'),
            ]),
            interval_ms: new Required([
                new Type('int'),
                (function (i) {
                    return new Callback(
                      (value, context, path, extra) =>
                        new Promise((resolve, reject) => {

                            if (value < i) {

                                context
                                  .buildViolation(`Interval can't be smaller than {{ callback }}.`)
                                  .atPath(path)
                                  .setParameter('{{ callback }}', ms(i))
                                  .setCode("CALLBACK_5")
                                  .setInvalidValue(value)
                                  .addViolation()
                                ;

                                if (extra && extra.stop) {

                                    return reject('reject Callback_5');
                                }
                            }

                            resolve('resolve Callback_5');
                        })
                    );
                }(parseInt(process.env.MIN_INTERVAL_MILLISECONDS, 10)))
                // }(generate({s: 5})))
            ]),
            project_id: new Required([
                new Type('int'),
            ]),
        };

        if (typeof entityPrepared.description !== 'undefined' && entityPrepared.description !== null) {

            collection.description = new Optional(new Type('string'));
        }

        if (entityPrepared.type === 'passive') {

            collection.password = new Required([
                new Type('string'),
                new NotBlank(),
                new Length({min: 8}),
            ]);
        }
        else if (typeof entityPrepared.password !== 'undefined' && entityPrepared.password !== null) {

            collection.password = new Optional(new Type('string'));
        }

        return new Collection(collection);
    },
}, table, id);