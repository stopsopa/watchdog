
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const th = msg => new Error(`users.js error: ${msg}`);

const {
  generate,
} = require('../lib/password');

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.users;

  const users_list_populate = async ({
    target,
    trx,
  }) => {

    log.dump({
      users_list_populate: true,
    })

    try {

      const list = await man.fetch(trx, `select * from :table:`);

      target.emit('users_list_populate', {
        list,
      })
    }
    catch (e) {

      log.dump({
        users_list_populate_error: e,
      }, 2);

      socket.emit('users_list_populate', {
        error: 'failed to fetch users list from database',
      })
    }
  }

  socket.on('users_list_populate', () => users_list_populate({
    target: socket,
  }));

  socket.on('users_form_populate', async id => {

    log.dump({
      users_form_populate: id
    })

    try {

      let form;

      if (id) {

        form = await man.find(id);
      }
      else {

        form = await man.initialize({
          // project_id,
          // type,
        });
      }

      socket.emit('users_form_populate', {
        form,
      })
    }
    catch (e) {

      log.dump({
        users_form_populate_error: e,
      }, 2);

      socket.emit('users_form_populate', {
        error: `failed to fetch user by id '${id}' list from database`,
      })
    }
  })



  socket.on('users_form_submit', async ({
    form
  }) => {

    log.dump({
      users_form_submit: form,
    })

    let id              = form.id;

    try {

      const mode          = id ? 'edit' : 'create';

      let entityPrepared  = man.prepareToValidate(form, mode);

      let errors;

      // await delay(3000);

      await man.transactify(async trx => {

        const validators    = man.getValidators(mode, id, {
          trx,
          entity: entityPrepared,
        });

        errors        = await validator(entityPrepared, validators);

        if ( ! errors.count() ) {

          if (mode === 'edit') {

            await man.update(trx, entityPrepared, id);
          }
          else {

            id = await man.insert(trx, entityPrepared);
          }

          // await delay(300);

          form = await man.find(trx, id);

          if ( ! form ) {

            return socket.emit('users_form_populate', {
              error: `Database state conflict: updated/created entity doesn't exist`,
            })
          }

          await users_list_populate({
            target: io,
            trx,
          });
        }
      });

      socket.emit('users_form_populate', {
        form,
        errors: errors.getTree(),
        submitted: true,
      })
    }
    catch (e) {

      log.dump({
        users_form_submit_error: e,
      }, 2);

      socket.emit('users_form_submit', {
        error: `failed to fetch probe by id '${id}' list from database.......`,
      })
    }
  })

  socket.on('users_delete', async id => {

    log.dump({
      users_delete: id,
    })

    let found = {};

    try {

      found = await man.find(id);

      await man.delete(id);

      await users_list_populate(io);

      socket.emit('users_delete', {
        found,
      })
    }
    catch (e) {

      if (String(e).includes(`a foreign key constraint fails`)) {

        let list = await man.queryColumn(`select group_concat(group_id) g from user_group where user_id = :id`, {
          id,
        });

        list = (list || '').split(',').map(u => parseInt(u, 10)).filter(Boolean);

        socket.emit('users_delete', {
          error: `First remove user from all groups ` + list.map(id => `<a href="/groups/${id}">${id}</a>`).join(', '),
          found,
          list,
          miliseconds: 15 * 1000
        });
      }
      else {

        socket.emit('users_delete', {
          error: `Server error`,
          found,
        });
      }

      log.dump({
        users_delete_error: e,
      }, 2);
    }
  })

  socket.on(`users_set_password`, async ({
    password,
    id
  }) => {

    let error = false;

    try {

      if ( ! Number.isInteger(id) ) {

        throw new Error(`id is not an integer`);
      }

      if (typeof password !== 'string') {

        throw new Error(`password is not a string`);
      }

      password = password.trim();

      if ( password.length < 8 ) {

        throw new Error(`password should be at least 8 characters`);
      }

      await man.query(`update :table: set password = :password where id = :id`, {
        password: JSON.stringify(generate(password), null, 4),
        id,
      });
    }
    catch (e) {

      error = e.message;
    }

    socket.emit(`users_set_password`, error);
  });

}