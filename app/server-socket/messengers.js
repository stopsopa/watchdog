
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const { extractRequest } = require('../lib/telegram')

const th = msg => new Error(`telegram.js error: ${msg}`);

const driver = require('../boxDriver');

module.exports = ({
  io,
  socket,
  telegramMiddleware,
}) => {

  const man   = knex().model.postbox;

  const postbox_list_atom_populate = async ({
    target,
    trx,
  }) => {

    log.dump({
      postbox_list_atom_populate: true,
    });

    try {

      const list = await man.fetch(trx, `select * from :table:`);

      target.emit('postbox_list_atom_populate', {
        list,
      })
    }
    catch (e) {

      log.dump({
        postbox_list_atom_populate_error: e,
      }, 2);

      socket.emit('postbox_list_atom_populate', {
        error: 'failed to fetch postbox_list list from database',
      })
    }
  }

  socket.on('postbox_list_atom_populate', () => postbox_list_atom_populate({
    target: socket,
  }));

  socket.on('postbox_form_atom_populate', async ({
    id,
  }) => {

    log.dump({
      postbox_form_atom_populate: id
    })

    try {

      let form;

      if (id) {

        form = await man.find(id);
      }
      else {

        form = await man.initialize();
      }

      socket.emit('postbox_form_atom_populate', {
        form,
      })
    }
    catch (e) {

      log.dump({
        postbox_form_atom_populate_error: e,
      }, 3);

      socket.emit('postbox_form_atom_populate', {
        error: `failed to fetch messenger by id '${id}' list from database`,
      })
    }
  })

  socket.on('postbox_form_submit', async form => {

    const sample = {...form};

    if (typeof sample.code === 'string') {

      sample.description = `String length: ${sample.description.length}`;
    }

    log.dump({
      postbox_form_submit: sample,
    });

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

            await man.update(true, trx, form, id);
          }
          else {

            id = await man.insert(trx, form);
          }

          form = await man.find(trx, id);

          await driver.updateById(id, trx);

          if ( ! form ) {

            return socket.emit('probes_form_populate', {
              error: `Database state conflict: updated/created entity doesn't exist`,
            })
          }

          await postbox_list_atom_populate({
            target: io,
            trx,
          });
        }
      });

      socket.emit('postbox_form_atom_populate', {
        form,
        errors: errors.getTree(),
        submitted: true,
      })
    }
    catch (e) {

      e = se(e)

      log.dump({
        postbox_form_submit_error: e,
      }, 2);

      socket.emit('postbox_form_atom_populate', {
        error: `database error`,
        submitted: true,
      })
    }
  })

  socket.on('postbox_delete', async id => {

    log.dump({
      postbox_delete: id,
    })

    try {

      await man.transactify(async trx => {

        const entity = await man.find(trx, id);

        if (entity) {

          await man.delete(trx, id);
        }

        await driver.unregister(id);

        await postbox_list_atom_populate({
          target: io,
          trx,
        });
      });
    }
    catch (e) {

      log.dump({
        postbox_delete_error: e,
      }, 2);

      socket.emit('postbox_delete', {
        error: `First detach all users and groups from messenger in order to remove it`,
      })
    }
  });
}