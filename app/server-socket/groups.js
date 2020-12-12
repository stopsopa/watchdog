
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const th = msg => new Error(`groups.js error: ${msg}`);

const driver = require('../groupsDriver');

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.groups;

  const groups_list_populate = async (target) => {

    log.dump({
      groups_list_populate: true,
    })

    try {

      const list = await man.fetch(`select * from :table:`);

      target.emit('groups_list_populate', {
        list,
      })
    }
    catch (e) {

      log.dump({
        groups_list_populate_error: e,
      }, 2);

      socket.emit('groups_list_populate', {
        error: 'failed to fetch groups list from database',
      })
    }
  }

  socket.on('groups_list_populate', () => groups_list_populate(socket));

  socket.on('groups_form_populate', async id => {

    log.dump({
      groups_form_populate: id
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

      socket.emit('groups_form_populate', {
        form,
      })
    }
    catch (e) {

      log.dump({
        groups_form_populate_error: e,
      }, 2);

      socket.emit('groups_form_populate', {
        error: `failed to fetch group by id '${id}' list from database`,
      })
    }
  });

  socket.on('groups_form_submit', async ({
    form
  }) => {

    log.dump({
      groups_form_submit: form,
    })

    let id              = form.id;

    try {

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

        form = await man.find(id);

        await driver.updateById(id);

        if ( ! form ) {

          return socket.emit('groups_form_populate', {
            error: `Database state conflict: updated/created entity doesn't exist`,
          })
        }

        await groups_list_populate(io);
      }

      socket.emit('groups_form_populate', {
        form,
        errors: errors.getTree(),
        submitted: true,
      })
    }
    catch (e) {

      log.dump({
        groups_form_submit_error: e,
      }, 2);

      socket.emit('groups_form_submit', {
        error: `failed to fetch group by id '${id}' list from database.......`,
      })
    }
  })

  socket.on('groups_delete', async id => {

    log.dump({
      groups_delete: id,
    })

    let found = {};

    try {

      found = await man.find(id);

      await man.delete(id);

      await driver.unregister(id);

      await groups_list_populate(io);

      socket.emit('groups_delete', {
        found,
      })
    }
    catch (e) {

      log.dump({
        groups_delete_error: e,
      }, 2);

      socket.emit('groups_delete', {
        error: `First detach all users from the group`,
        found,
      })
    }
  })
}