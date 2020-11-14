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

  const {
    state: socket,
  } = useContext(StoreContextSocket);


   useEffect(() => {

      if (socket) {

        const abc = abc => {
          /// ...
        };

        socket.on('abc', abc)

        return () => { // https://stackoverflow.com/a/34716449/5560682
          socket.off('abc', abc)
        }
      }

    }, [socket]);
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

    window.ren = () => {
      // setSocket(null);
      setTimeout(() => {

        setSocket(socket);
      }, 500);
    }

    let handler = false, i = 0;

    socket.on('connect', () => {

      log.dump('Connection renewed')

      socket.on('git_status', data => {

        const {
          NODE_ENV,  // : "production"
          githash,   // : "66c9be4"
          gittime,   // : "2020-11-13_23-53-19"
          mode,      // : "prod"
          time,      // : "2020-11-14_00-30-22"
        } = data;

        const prev = getStoreAssoc(`git_status`);

        if ( typeof prev === 'undefined' ) {

          setStoreAssoc('git_status', data);
        }
        else {

          if (prev.NODE_ENV === 'production') {

            if (time !== prev.time) {

              try {

                location.reload();
              }
              catch (e) {

                throw new Error(`git_status error: Can't reload the page`);
              }
            }
          }
        }
      });

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

  }, []);

  return (<StoreContext.Provider value={{
    state: socket,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

// actions && selectors: