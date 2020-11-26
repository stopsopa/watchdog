/**
 * https://socket.io/docs/emit-cheatsheet/
 * https://socket.io/get-started/chat/#Broadcasting
 */

import React, {
  createContext,
  useEffect,
  useState,
} from 'react';

import io from 'socket.io-client';

import log from 'inspc';

/**
 *
  import {
    StoreContext as StoreContextSocket,
  } from './_storage/storeSocket';

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  if ( ! socket) {

    socket = {};
  }

   useEffect(() => {

      try {

        const abc = abc => {
          /// ...
        };

        socket.on('abc', abc)

        return () => { // https://stackoverflow.com/a/34716449/5560682
          socket.off('abc', abc)
        }

      }
      catch (e) {

      }

    }, [socket.id]);
 */


import {
  actionGlobalLoaderError,
  actionGlobalLoaderMessage,
  actionGlobalLoaderOff,
} from '../components/GlobalLoader/storeGlobalLoader';

import {
  setStatusReset,
  setStoreAssoc,
  setStoreAssocDelete,
  getStoreAssoc,
} from './storeAssoc'

export const StoreContext = createContext();

const th = (function () {
  const name = __filename.split('/').pop().split('.').shift();
  StoreContext.displayName = `${name}_context`;
  StoreSocketProvider.displayName = `${name}_component`;
  return msg => {
    let data = '';
    if (arguments.length > 1) data = `, data: >>>${JSON.stringify(arguments[1], null, 4)}<<<`;
    return new Error(`${name} context error: ${msg}${data}`)
  }
}());

/**
 * WARNING: Be careful to create only one provider on the page
 */
export function StoreSocketProvider(props) {

  const [ socket, setSocket ] = useState(false);

  useEffect(() => {

    const socket = io({
      transports: ['websocket'] // https://socket.io/docs/client-api/#With-websocket-transport-only
    });

    window.socket = socket;

    console && console.log && console.log('window.socket registered');

    let handler = false, i = 0;

    socket.on('connect', () => {

      socket.emit('status_all_probes')

      clearInterval(handler);

      i = 0;

      if (handler) {

        actionGlobalLoaderMessage("Connection renewed", 1000);
      }

      setSocket(socket);
    });

    socket.on('disconnect', () => {

      log.dump('disconnect from server')

      setStatusReset();

      clearInterval(handler);

      i = 0;

      handler = setInterval(() => {

        actionGlobalLoaderError("Lost socket connection with server ... waiting to reconnect " +(".".repeat(i)), false);

        i += 1;

        if (i > 3) {

          i = 0;
        }
      }, 500);

      // setSocket(undefined);
    });

    socket.on('telegram_get_current_webhook', data => setStoreAssoc('telegram_get_current_webhook', data));

    socket.on('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected', num => setStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected', num));

    socket.on('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server', val => setStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server', val));

    socket.on('server_status', ({
      git_status,
      messengers_detection,
      getTelegramNodeServerStatus = {},
    }) => {

      setStoreAssoc('messengers_detection', messengers_detection);

      setStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server', getTelegramNodeServerStatus.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_connected_to_server);

      setStoreAssoc('PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected', getTelegramNodeServerStatus.PROTECTED_TELEGRAM_ENABLE_SOCKET_PROXY_clients_connected);

      const {
        NODE_ENV,  // : "production"
        githash,   // : "66c9be4"
        gittime,   // : "2020-11-13_23-53-19"
        mode,      // : "prod"
        time,      // : "2020-11-14_00-30-22"
      } = git_status || {};

      const prev = getStoreAssoc(`git_status`);

      if ( typeof prev === 'undefined' ) {

        setStoreAssoc('git_status', git_status);
      }
      else {

        if (prev.NODE_ENV === 'production') {

          if (time !== prev.time) {

            try {

              const delay = 10 * 1000;

              log.dump({
                'location.reload() in': delay
              })

              setTimeout(() => {

                location.reload();
              }, delay);
            }
            catch (e) {

              throw new Error(`git_status error: Can't reload the page`);
            }
          }
        }
      }
    });
  }, []);

  return (<StoreContext.Provider value={{
    state: socket,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

// actions && selectors: