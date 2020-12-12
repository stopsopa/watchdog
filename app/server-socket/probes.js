
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const probeClass       = require('../probeClass');

const driver = require('../probeDriver');

const th = msg => new Error(`probes.js error: ${msg}`);

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

      const list = await man.fetch(`
select  id,
        name,
        description,
        type,
        enabled,
        interval_ms,
        created,
        updated,
        project_id,
        password,
        detailed_log,
        service_mode
from :table: 
where project_id = :project_id 
order by created
`, {
        project_id,
      });

      target.emit('probes_list_populate', {
        project_id,
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

        // await delay(300);

        form = await man.find(id);

        if ( ! form ) {

          return socket.emit('probes_form_populate', {
            error: `Database state conflict: updated/created entity doesn't exist`,
          })
        }

        await driver.updateById(id);

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

      const tool = probeClass({
        id: 0,
        code,
        type,
      });

      const result = await tool.prodRunActive();

      socket.emit('probes_run_code', result)
    }
    catch (e) {

      e = se(e);

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

      driver.unregister(id);

      await probes_list_populate(io, probe.project_id);

      io.emit('probe_status_delete', id);
    }
    catch (e) {

      log.dump({
        probes_delete_error: e,
      }, 2);

      socket.emit('probes_delete', {
        error: `failed to fetch probe by id '${id}' list from database.......`,
      })
    }
  });

  socket.on('status_all_probes', async () => {

    log.dump({
      status_all_probes: '',
    })

    try {

      let list = driver.getProbesArray().map(r => {

        const {
          log,
          ...rest
        } = r.state();

        return rest;
      }).reduce((acc, probe) => {

        acc[probe.db.id] = probe;

        return acc;
      }, {});

      socket.emit('status_all_probes', {
        list,
      })
    }
    catch (e) {

      log.dump({
        status_all_probes: e,
      }, 2);

      socket.emit('status_all_probes', {
        error: `status_all_probes error`,
      })
    }
  });



}