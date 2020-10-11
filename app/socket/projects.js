
const log = require('inspc');

const knex = require('knex-abstract');

module.exports = ({
  io,
  socket,
}) => {

  const man   = knex().model.projects;

  socket.on('projects_populate_list', async () => {

    try {

      const list = await man.query('select * from :table: order by created');

      socket.emit('projects_populate_list', {
        list,
      })
    }
    catch (e) {

      log.dump({
        projects_populate_list_error: e,
      }, 2);

      socket.emit('projects_populate_list', {
        error: 'failed to fetch projects list from database',
      })
    }
  })
}