
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const serializeError = require('nlab/serializeError');

const serverProbe       = require('../serverProbe');

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.probes;

  const probes_list_populate = async (target, project_id) => {

    log.dump({
      probes_list_populate: project_id,
    })

    try {

      const list = await man.fetch('select * from :table: where project_id = :project_id order by created', {
        project_id,
      });

      target.emit('probes_list_populate', {
        list,
      })
    }
    catch (e) {

      log.dump({
        probes_list_populate_error: e,
      }, 2);

      socket.emit('probes_list_populate', {
        error: 'failed to fetch probes list from database',
      })
    }
  }

  socket.on('probes_list_populate', project_id => probes_list_populate(socket, project_id));

  socket.on('probes_form_populate', async ({
    project_id,
    probe_id,
    type,
  }) => {

    log.dump({
      probes_form_populate: {
        project_id,
        probe_id,
      }
    })

    try {

      let form;

      if (probe_id) {

        form = await man.find(probe_id);
      }
      else {

        form = await man.initialize({
          project_id,
          type,
        });
      }

      socket.emit('probes_form_populate', {
        form,
      })
    }
    catch (e) {

      log.dump({
        probes_form_populate_error: e,
      }, 2);

      socket.emit('probes_form_populate', {
        error: `failed to fetch probe by id '${id}' list from database`,
      })
    }
  })

  socket.on('probes_form_submit', async form => {

    const sample = {...form};

    if (typeof sample.code === 'string') {

      sample.code = `String length: ${sample.code.length}`;
    }

    log.dump({
      probes_form_submit: sample,
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

          return socket.emit('probes_form_populate', {
            error: `Database state conflict: updated/created entity doesn't exist`,
          })
        }

        await probes_list_populate(io, form.project_id);
      }

      socket.emit('probes_form_populate', {
        form,
        errors: errors.getTree(),
        submitted: true,
      })
    }
    catch (e) {

      log.dump({
        probes_form_submit_error: e,
      }, 2);

      socket.emit('probes_form_submit', {
        error: `failed to fetch probe by id '${id}' list from database.......`,
      })
    }
  })

  socket.on('probes_run_code', async ({
    code,
    type
  }) => {

    log.dump({
      probes_run_code: `String length: ${code.length}`,
      type,
    })

    try {

      const tool = serverProbe({
        id: 0,
        code,
        type,
      });

      const result = await tool.testRun();

      socket.emit('probes_run_code', result)
    }
    catch (e) {

      e = serializeError(e);

      log.dump({
        probes_run_code_catch_error: e,
      }, 2);

      socket.emit('probes_run_code', {
        status: 'catch',
        data: e,
      })
    }
  })

  socket.on('probes_delete', async id => {

    log.dump({
      probes_delete: id,
    })

    try {

      const probe = await man.find(id);

      await man.delete(id);

      await probes_list_populate(io, probe.project_id);
    }
    catch (e) {

      log.dump({
        probes_delete_error: e,
      }, 2);

      socket.emit('probes_delete', {
        error: `failed to fetch probe by id '${id}' list from database.......`,
      })
    }
  })
}