
const abstract          = require('knex-abstract');

const { Opt }           = abstract;

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

const table             = 'group';

const id                = 'id';

module.exports = knex => extend(knex, prototype, {
    filters: {
        def : ['created', 'updated', 'description'],
    },
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
            users: [],
            // enabled: true,
            ...extra,
        }
    },
    fromDb: async function (row, opt, trx) {

        if ( ! isObject(row) ) {

            return row;
        }

        if (typeof row.users === 'undefined') {

            if ( ! Array.isArray(row.users) && Number.isInteger(row.id)) {

                row.users = await this.fetchUsers(trx, opt, row.id);
            }
        }
        else {

            if (typeof row.users === 'string') {

                row.users = row.users.split(",").map(id => parseInt(id, 10));
            }

            if ( ! Array.isArray(row.users) ) {

                row.users = [];
            }
        }

        return row;
    },
    toDb: async function (row, opt, trx) {

        if ( ! isObject(row) ) {

            return row;
        }

        delete row.users;
        //
        // delete row.password;

        // row.enabled = Boolean(row.enabled);

        //
        // row.detailed_log = Boolean(row.detailed_log);
        //
        // row.service_mode = Boolean(row.service_mode);

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
    fetchUsers: async function (...args) {

        let [debug, trx, id] = a(args);

        const list = await this.query(trx, debug, `
select              ug.user_id id
from                :table: g
         inner join user_group ug
                 on g.id = ug.group_id
where               g.id = :id     
`, {
            id,
        });

        return list.map(u => parseInt(u.id, 10));
    },
    updateUsers: async function (...args) {

        let [debug, trx, groupId, usersIds] = a(args);

        await this.clearUsers(debug, trx, groupId);

        if (Array.isArray(usersIds)) {

            for (let user_id of usersIds) {

                await knex.model.user_groups.insert(debug, trx, {
                    group_id: groupId,
                    user_id,
                })
            }
        }
    },
    clearUsers: async function(...args) {

        let [debug, trx, groupId] = a(args);

        return await this.query(debug, trx, `delete from user_group where group_id = :id`, {
            id: groupId,
        });
    },
    update: async function (...args) {

        let [debug, trx, entity, id] = a(args);

        return await this.transactify(trx, async trx => {

            const {
                users = [],
              ...rest
            } = entity;

            await this.updateUsers(debug, trx, id, users);

            return prototype.prototype.update.call(this, debug, trx, rest, id);
        });
    },
    insert: async function (...args) {

        let [debug, trx, entity] = a(args);

        return await this.transactify(trx, async trx => {

            let users = [];

            if (Array.isArray(entity.users)) {

                users = entity.users;
            }

            entity = this.toDb(Object.assign({}, entity));

            const id = await prototype.prototype.insert.call(this, debug, trx, entity);

            if (users) {

                await this.updateUsers(debug, trx, id, users);
            }

            return id;
        });
    },
    listImportantColumns: async function (...args) {

        let [debug, trx] = a(args);

        const columns = await this.fetchColumnsFiltered(debug, trx, {
            format: 'list',
        });

        return await this.fetch(debug, trx, `
select              ${columns.join(', ')},
                    group_concat(ug.user_id) users
from                :table: g
          left join user_group ug
                 on g.id = ug.group_id
group by            g.id
`);
    },
    findFiltered: async function (...args) {

        let [debug, trx, id] = a(args);

        const columns = await this.fetchColumnsFiltered(debug, trx, {
            format: 'list',
        });

        return await this.queryOne(debug, trx, `select ${columns.join(`, `)} from :table: where id = :id`, {
            id,
        });
    },
    delete: async function (id, ...args) {

        // await this.clearUsers(id);

        return await prototype.prototype.delete.call(this, id, ...args);
    },
    find: async function (...args) {

        let [debug, trx, id] = a(args);

        if ( ! id ) {

            throw `groups.js::find(): id not specified or invalid`;
        }

        const columns = await this.fetchColumnsFiltered(debug, trx, {
            format: 'list',
        });

        const query = `
select              ${columns.join(', ')}, group_concat(ug.user_id) users
from                :table: g
          left join user_group ug
                 on g.id = ug.group_id
where               g.id = :id
GROUP BY            g.id
ORDER BY            id desc
        `;

        const params = {id};

        const data = await this.queryOne(Opt({
            ...debug,
            both: false,
        }), trx, query, params);

        return this.fromDb(data, debug, trx);
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

        data = {...data};

        // if (typeof data.id !== 'undefined') {
        //
        //     delete data.id;
        // }

        delete data.created;

        delete data.updated;

        // delete data.label;
        //
        // delete data.password;

        return data;
    },
    getValidators: function (mode, id, entityPrepared) {

        const collection = {
            id: new Optional(),
            users: new Optional(),
            description: new Optional(),
            name: new Required([
                new NotBlank(),
                new Length({max: 50}),
            ]),
            // lastName: new Required([
            //     new NotBlank(),
            //     new Length({max: 50}),
            // ]),
            // // password: new Required([
            // //     new NotBlank(),
            // //     new Length({max: 255}),
            // // ]),
            // email: new Required([
            //     new NotBlank(),
            //     new Email(),
            //     new Length({max: 255}),
            // ]),
            // enabled: new Required([
            //     new Type('bool'),
            // ]),
        };

        return new Collection(collection);
    },
}, table, id);