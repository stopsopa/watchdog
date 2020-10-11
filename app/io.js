
const log               = require('inspc');

const { wait }          = require('nlab/delay');

const trim              = require('nlab/trim');

const th                = msg => new Error(`io.js error: ${msg}`);

let io;

let list = [];

const tool = {}

function bindList(socket) {

  list.forEach(({name, fn}) => {

    socket.on(name, fn);
  })
}

tool.bind = (opt = {}) => {

  ({io} = opt);

  const {
    bind,
    ...rest
  } = opt;

  io.on('connection', socket => {

    console.log('io.js connection', socket.id)

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

    bindList(socket);

    // socket.on('abc', (a, b, c, cb) => {
    //
    //   log.dump({
    //     t: 'one',
    //     a, b, c
    //   })
    //
    //   cb && cb('ack', 'b')
    //
    //   // now call in browser:
    //   // window.socket.emit('abc', 'raz', 'dwa', {trzy: 'ctery'}, (a, b) => console.log('ac: ', a, b))
    // });
    //
    // socket.on('abc', (a, b, c) => {
    //   log.dump({
    //     t: 'two',
    //     a, b, c
    //   })
    // });

    bind({
      io,
      socket,
      ...rest,
    });
  });
};

tool.on = (name, fn) => {

  if ( ! io ) {

    throw th(`io.js->on() method error, first call bind() method`);
  }

  if ( typeof name !== 'string' ) {

    throw th(`io.js->on() method error, typeof name !== 'string'`);
  }

  if ( ! name.trim() ) {

    throw th(`io.js->on() method error, name is an empty`);
  }

  if ( typeof fn !== 'function' ) {

    throw th(`io.js->on() method error, fn is not a function for given name event '${name}'`);
  }

  var sockets = io.sockets.sockets;

  for(var id in sockets)
  {
    var socket = sockets[id]; //loop through and do whatever with each connected socket

    socket.on(name, fn);
  }
}

tool.off = (name, fn) => {

  if ( ! io ) {

    throw th(`io.js->off() method error, first call bind() method`);
  }

  if ( typeof name !== 'string' ) {

    throw th(`io.js->on() method error, typeof name !== 'string'`);
  }

  if ( ! name.trim() ) {

    throw th(`io.js->on() method error, name is an empty`);
  }

  var sockets = io.sockets.sockets;

  if (typeof fn === 'function') {

    for(let id in sockets) {

      sockets[id].off(name, fn);
    }

    list = list.filter(b => ! (b.name === name && b.fn === fn));
  }
  else {

    for(let id in sockets) {

      sockets[id].removeAllListeners(name);
    }

    list = list.filter(b => {

      return b.name !== name;
    });
  }
}

module.exports = tool;


