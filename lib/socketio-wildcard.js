/**
 * logic from : https://www.npmjs.com/package/socketio-wildcard
 * version 2.0.0
 *
 * source:
 *    https://github.com/hden/socketio-wildcard/blob/acd8083675646e285ab2e363cb49a3153b18edec/index.js
 *
 *  works well with:
 *  {
  "dependencies": {
    "basic-auth": "^2.0.1",
    "compression": "^1.7.4",
    "dotenv-up": "^1.0.30",
    "express": "^4.17.1",
    "inspc": "^0.0.19",
    "lodash": "^4.17.20",
    "mkdirp": "^1.0.4",
    "nlab": "^0.0.80",
    "semantic-ui-css": "^2.4.1",
    "serialize-error": "^7.0.1",
    "socket.io": "^2.3.0"
  },
  "devDependencies": {
    "@babel/core": "^7.11.6",
    "@babel/preset-env": "^7.11.5",
    "@babel/preset-react": "^7.10.4",
    "babel-loader": "^8.1.0",
    "clean-webpack-plugin": "^3.0.0",
    "colors": "^1.4.0",
    "css-loader": "^4.3.0",
    "mini-css-extract-plugin": "^0.12.0",
    "onchange": "^7.0.2",
    "react": "^16.13.1",
    "react-dom": "^16.13.1",
    "regenerator-runtime": "^0.13.7",
    "sass": "^1.26.12",
    "sass-loader": "^10.0.2",
    "semantic-ui-react": "^2.0.0",
    "style-loader": "^1.3.0",
    "webpack": "^4.44.1",
    "webpack-cli": "^3.3.12"
  }

  usage:

    From now on when you call on server event:

    socket.emit('abc', data)
      this will reach only server

    socket.emit('a:abc', data)
      this will reach connected clients

    socket.emit('as:abc', data)
      or
    socket.emit('sa:abc', data)
      this will reach server and all connected clients

    socket.emit('bs:abc', data)
      or
    socket.emit('sb:abc', data)
      this will reach server and all connected clients - except sender
      its broadcast mode like described here: https://socket.io/get-started/chat/#Broadcasting

  adding to the project:

    server.js:

      const app = express();

      const server    = require('http').createServer(app);

      const io        = require('socket.io')(server); // io

      io.use(require('./lib/socketio-wildcard')());

      require('./webpack/src/io').bind({
        io
      });

      (function () {

        WARNING: CHECK io.js FILE FOR THIS BIT
        const io = require('./webpack/src/io');

        const ref = (a, b, c) => {
          log.dump({
            "require('./webpack/src/io')" : {
              a, b, c
            }
          })
        };

        io.on('abc', ref)

        io.on('abc', (a, b, c) => {
          log.dump({
            "second" : {
              a, b, c
            }
          })
        })

        setTimeout(() => {

          io.off('abc', ref); // remova abc listener but only for this function

        }, 5000);

        setTimeout(() => {

          io.on('abc', (a, b, c) => {
            log.dump({
              "bindlater" : {
                a, b, c
              }
            })
          })

          io.off('abc') // unbind all 'abc'

        }, 10000);

      }());

    webpack/src/io.js

      const express           = require('express');

      const Router            = express.Router;

      const log               = require('inspc');

      const trim              = require('nlab/trim');

      module.exports = (opt = {}) => {

        const {
          io,
        } = opt;

        io.on('connection', socket => {

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


 */

'use strict'

const trim              = require('nlab/trim');

const log               = require('inspc');

var BuiltInEmitter = require('events').EventEmitter

module.exports = function (CustomEmitter) {
  var Emitter = CustomEmitter || BuiltInEmitter   // original
  var emit = Emitter.prototype.emit               // original
  function onevent (packet) {
    var args = packet.data || []                  // original
    if (packet.id != null) {                      // original
      args.push(this.ack(packet.id))              // original
    }                                             // original
    emit.call(this, '*', packet)         // original




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
      //   place: 'override',
      //   name,
      //   mode,
      //   s,
      //   'mode !== s': mode !== s
      // })

      s = mode !== s;

      if (s) {

        emit.call(this, name, ...rest)
      }
    }




    return emit.apply(this, args)                 // original
  }

  return function (socket, next) {
    if (socket.onevent !== onevent) {             // original
      socket.onevent = onevent                    // original
    }                                             // original
    return next ? next() : null                   // original
  }
}
