
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const th = msg => new Error(`users.js error: ${msg}`);

const driver = require('../usersDriver');

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

          await driver.updateById(id, trx);

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

      await driver.unregister(id);

      await users_list_populate({
        target: io
      });

      socket.emit('users_delete', {
        found,
      })
    }
    catch (e) {

      let user_group = 'empty';

      let postbox_user = 'empty';

      let error = `Server error`;

      if (String(e).includes(`user_group`)) {

        user_group = await man.queryColumn(`select group_concat(group_id) g from user_group where user_id = :id`, {
          id,
        });

        user_group = (user_group || '').split(',').map(u => parseInt(u, 10)).filter(Boolean);

        if (user_group.length) {

          error = `First detach user from all groups `;

          error += user_group.map(id => `<a href="/groups/${id}" target="_blank">${id}</a>`).join(', ');
        }
      }

      if (String(e).includes(`postbox_user`)) {

        postbox_user = await man.queryColumn(`select group_concat(box_id) g from postbox_user where user_id = :id group by user_id`, {
          id,
        });

        postbox_user = (postbox_user || '').split(',').map(u => parseInt(u, 10)).filter(Boolean);

        if (postbox_user.length) {

          error = `First detach this user from all listed messengers `;

          error += postbox_user.map(id => `<a href="/messengers/edit/${id}" target="_blank">${id}</a>`).join(', ');
        }
      }

      socket.emit('users_delete', {
        error,
        found,
        user_group,
        postbox_user,
        miliseconds: 15 * 1000
      });

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

      await driver.updateById(id);
    }
    catch (e) {

      error = e.message;
    }

    socket.emit(`users_set_password`, error);
  });

}