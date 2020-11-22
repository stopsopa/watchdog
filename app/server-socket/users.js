
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const th = msg => new Error(`users.js error: ${msg}`);

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.users;

  const users_list_populate = async (target) => {

    log.dump({
      users_list_populate: true,
    })

    try {

      const list = await man.fetch(`select * from :table:`);

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

  socket.on('users_list_populate', () => users_list_populate(socket));

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

    try {

      let id              = form.id;

      const mode          = id ? 'edit' : 'create';

      let entityPrepared  = man.prepareToValidate(form, mode);

      const validators    = man.getValidators(mode, id, entityPrepared);

      const errors        = await validator(entityPrepared, validators);

      if ( ! errors.count() ) {

        if (mode === 'edit') {

          await man.update(entityPrepared, id);
        }
        else {

          id = await man.insert(entityPrepared);
        }

        // await delay(300);

        form = await man.find(id);

        if ( ! form ) {

          return socket.emit('users_form_populate', {
            error: `Database state conflict: updated/created entity doesn't exist`,
          })
        }

        await users_list_populate(io);
      }

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

      log.dump({
        users_delete_error: e,
      }, 2);

      socket.emit('users_delete', {
        error: `First remove all users of this project`,
        found,
      })
    }
  })

}