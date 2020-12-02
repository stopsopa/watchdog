
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

const validator = require('@stopsopa/validator');

const se = require('nlab/se');

const { extractRequest } = require('../lib/telegram')

const th = msg => new Error(`telegram.js error: ${msg}`);

module.exports = ({
  io,
  socket,
  telegramMiddleware,
}) => {

  const man   = knex().model.postbox;

  socket.on('postbox_list_atom_populate', async () => {

    const target = socket;

    log.dump({
      postbox_list_atom_populate: true,
    });

    try {

      const list = await man.fetch(`select * from :table:`);

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
  });

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
}