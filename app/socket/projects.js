
const log = require('inspc');

const knex = require('knex-abstract');

const delay = require('nlab/delay');

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.projects;

  socket.on('projects_list_populate', async () => {

    log.dump('projects_list_populate')

    try {

      const list = await man.query('select * from :table: order by created');

      socket.emit('projects_list_populate', {
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
  })

  socket.on('projects_form_populate', async id => {

    log.dump({
      projects_form_populate: id
    })

    try {

      let form;

      if (id) {

        form = await man.query('select * from :table: where id = :id', {
          id,
        });
      }
      else {

        form = await man.initialize();
      }

      socket.emit('projects_form_populate', {
        form,
      })
    }
    catch (e) {

      log.dump({
        projects_form_populate_error: e,
      }, 2);

      socket.emit('projects_form_populate', {
        error: `failed to fetch project by id '${id}' list from database`,
      })
    }
  })

  socket.on('projects_form_submit', async form => {

    log.dump({
      projects_form_submit: form,
    })

    try {

      let errors;

      let id = form.id;

      // if (id) {
      //
      //   form = await man.query('select * from :table: where id = :id', {
      //     id,
      //   });
      // }
      // else {
      //
      //   form = await man.initialize();
      // }

      await delay(1000)

      socket.emit('projects_form_populate', {
        form,
        errors: {
          name: 'empty name'
        },
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
}