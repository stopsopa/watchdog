
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

    log('connected...');

    // * possible thanks to socketio-wildcard library
    socket.on('*', function(packet) {

      const {
        data = []
      } = packet;

      let [name, value] = data;

      if ( typeof name === 'string' && /^[ab]:.+/.test(name) ) {

        name = name.split(':');

        const mode = name.shift();

        name = name.join(':');

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
        abc,
      })
    });

    // you can send something here to initialize data in browser
    // socket.on('init', id => {
    //
    //   log('init: ' + id)
    // });
    //
    // socket.on('gethash', async () => {
    //
    //   try {
    //
    //     const hash = await mrun.generateNewHash();
    //
    //     socket.emit('sethash', hash);
    //   }
    //   catch (e) {
    //
    //     log.dump({
    //       gethash_error: e
    //     }, 3)
    //   }
    // });
    //
    // socket.on('start', async ({
    //   hash,
    //   url,
    // }) => {
    //
    //
    // });
    //
    // socket.on('load', async ({
    //   input,
    //   hash,
    //   offset,
    // }) => {

  });

  const router = Router();



  return router;
};


