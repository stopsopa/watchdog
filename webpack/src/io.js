
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

      let [name, ...rest] = data;

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

          return socket.broadcast.emit(name, ...rest);
        }

        if (mode === 'a') {

          return io.emit(name, ...rest);
        }
      }
    });

    socket.on('abc', (a, b, c, cb) => {

      log.dump({
        t: 'one',
        a, b, c
      })

      cb && cb('ack', 'b')

      // now call in browser:
      // window.socket.emit('abc', 'raz', 'dwa', {trzy: 'ctery'}, (a, b) => console.log('ac: ', a, b))
    });

    socket.on('abc', (a, b, c) => {
      log.dump({
        t: 'two',
        a, b, c
      })
    });

  });

  const router = Router();

  return router;
};


