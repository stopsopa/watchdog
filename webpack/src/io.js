
const express           = require('express');

const Router            = express.Router;

const log               = require('inspc');

const { wait }          = require('nlab/delay');

const trim              = require('nlab/trim');

// const knex              = require('knex-abstract');

// const mrun              = knex().model.run;
//
// const mnodes            = knex().model.nodes;
//
// const mlogs             = knex().model.logs;
//
// const medges            = knex().model.edges;

module.exports = (opt = {}) => {

  const {
    io,
  } = opt;

  io.on('connection', socket => {

    // * possible thanks to socketio-wildcard library
    socket.on('*', function(packet) {

      const {
        data = []
      } = packet;

      let [name, value] = data;

      if ( typeof name === 'string' && /^s?[ab]s?:.+/.test(name) ) {

        name = name.split(':');

        let mode = name.shift();

        name = name.join(':');

        let s = trim(mode, 's');

        // log.dump({
        //   place: '*',
        //   name,
        //   mode,
        //   s,
        //   'mode !== s': mode !== s
        // })

        if (mode !== s) {

          mode = s;

          s = true;
        }
        else {

          s = false;
        }

        if (mode === 'b') {

          return socket.broadcast.emit(name, value);
        }

        if (mode === 'a') {

          return io.emit(name, value);
        }
      }
    });

    socket.on('abc', abc => {
      log.dump({

        serer: 'ggg',
        abc,
      })
    });

  });

  const router = Router();

  return router;
};


