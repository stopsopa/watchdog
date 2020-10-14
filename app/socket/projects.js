
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.projects;

  const projects_form_populate = async (target, id) => {

    log.dump({
      projects_form_populate: id
    })

    try {

      let form;

      if (id) {

        form = await man.find(id);
      }
      else {

        form = await man.initialize();
      }

      target.emit('projects_form_populate', {
        form,
      })
    }
    catch (e) {

      log.dump({
        projects_form_populate_error: e,
      }, 2);

      target.emit('projects_form_populate', {
        error: `failed to fetch project by id '${id}' list from database`,
      })
    }
  }

  const projects_list_populate = async target => {

    log.dump('projects_list_populate')

    try {

      const list = await man.query('select * from :table: order by created');

      target.emit('projects_list_populate', {
        list,
      })
    }
    catch (e) {

      log.dump({
        projects_list_populate_error: e,
      }, 2);

      socket.emit('projects_list_populate', {
        error: 'failed to fetch projects list from database',
      })
    }
  }

  socket.on('projects_list_populate', () => projects_list_populate(socket));

  socket.on('projects_form_populate', id => projects_form_populate(socket, id))

  socket.on('projects_form_submit', async form => {

    log.dump({
      projects_form_submit: form,
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

          return socket.emit('projects_form_populate', {
            error: `Database state conflict: updated/created entity doesn't exist`,
          })
        }

        await projects_list_populate(io);

        await projects_form_populate(io, id)
      }

      socket.emit('projects_form_populate', {
        form,
        errors: errors.getTree(),
        submitted: true,
      })
    }
    catch (e) {

      log.dump({
        projects_form_submit_error: e,
      }, 2);

      socket.emit('projects_form_submit', {
        error: `failed to fetch project by id '${id}' list from database.......`,
      })
    }
  })

  socket.on('projects_delete', async id => {

    log.dump({
      projects_delete: id,
    })

    try {

      await man.delete(id);

      await projects_list_populate(io);
    }
    catch (e) {

      log.dump({
        projects_delete_error: e,
      }, 2);

      socket.emit('projects_delete', {
        error: `failed to fetch project by id '${id}' list from database.......`,
      })
    }
  })
}