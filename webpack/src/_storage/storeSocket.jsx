
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
  } = React.useContext(StoreContextSocket);
 */

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

export function StoreSocketProvider(props) {

  const [ socket, setSocket ] = useState(false);

  useEffect(() => {

    const socket = io();

    window.socket = socket;

    socket.on('connect', () => {
      log.dump('connected to server')

      setSocket(socket);
    });

    socket.on('disconnect', () => {
      log.dump('disconnect from server')

      setSocket(undefined);
    });

    socket.on('abc', abc => {
      log.dump({
        abc
      })
    })

  }, []);

  return (<StoreContext.Provider value={{
    state: socket,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

// actions && selectors: