
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

  const users_list_populate = async (target, project_id) => {

    log.dump({
      users_list_populate: project_id,
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

      target.emit('users_list_populate', {
        project_id,
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

  socket.on('users_list_populate', project_id => users_list_populate(socket, project_id));

  socket.on('users_form_populate', async ({
    project_id,
    user_id,
    type,
  }) => {

    log.dump({
      users_form_populate: {
        project_id,
        user_id,
      }
    })

    try {

      let form;

      if (user_id) {

        form = await man.find(user_id);
      }
      else {

        form = await man.initialize({
          project_id,
          type,
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

}