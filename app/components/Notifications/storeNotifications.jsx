
import React, {
  createContext,
  useReducer,
} from 'react';

import wait from 'nlab/delay';

export const NOTIFICATIONS_ADD         = 'NOTIFICATIONS_ADD';
export const NOTIFICATIONS_REMOVE      = 'NOTIFICATIONS_REMOVE';
export const NOTIFICATIONS_UPDATE      = 'NOTIFICATIONS_UPDATE';

export const StoreContext = createContext();

const th = (function () {
  const name = __filename.split('/').pop().split('.').shift();
  StoreContext.displayName = `${name}_context`;
  StoreNotificationsProvider.displayName = `${name}_component`;
  return msg => {
    let data = '';
    if (arguments.length > 1) data = `, data: >>>${JSON.stringify(arguments[1], null, 4)}<<<`;
    return new Error(`${name} context error: ${msg}${data}`)
  }
}());

const initialState = [];

const reducer = (state = [], action) => {
  switch (action.type) {
    case NOTIFICATIONS_ADD:
      return [...[action.payload], ...state];
    case NOTIFICATIONS_REMOVE:
      return state.filter(item => (item.id !== action.payload));
    case NOTIFICATIONS_UPDATE:
      return state.map(item => {

        if (item.id === action.payload.id) {

          item = {...item, ...action.payload}
        }

        return item;
      });
    default:
      return state;
  }
};

let state, dispatch;

export function StoreNotificationsProvider(props) {

  [state, dispatch] = useReducer(reducer, initialState);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
  }}>{props.children}</StoreContext.Provider>);
}

const generateId = (function () {

  let i = 0;

  let max = 1000;

  return () => {

    i += 1;

    if (i > max) {

      i %= max;
    }

    return i;
  }
}());

function isObject(a) {
  return (!!a) && (a.constructor === Object);
  // return Object.prototype.toString.call(a) === '[object Object]'; // better in node.js to dealing with RowDataPacket object
};

const animationTime = 400;

const delay = 90;

const def= {
  time: 5000,
  msg: '',
  type: '' // warning, error or empty string (default green state)
};

export const notificationsRemove = async id => {

  const list = getNotificationsState();

  const found = (list || []).find(item => (item.id == id));

  if ( ! found ) {

    return;
  }

  const payload = { ...found };

  payload.type = payload.type.replace(/(\s|^)show(\s|$)/g, ' ');

  dispatch({
    type: NOTIFICATIONS_UPDATE,
    payload : {
      ...payload,
      type:payload.type + ' hide show'
    }
  });

  await wait(delay);

  dispatch({
    type: NOTIFICATIONS_UPDATE,
    payload : {
      ...payload,
      type:payload.type + ' hide'
    }
  });

  await wait(animationTime + (3 * delay) );

  dispatch({
    type: NOTIFICATIONS_REMOVE,
    payload: id
  });

  return payload
}

/**
 *  notificationsAdd('message') - explicit message, default green type, default delay (def: 5000 ms)
 *  notificationsAdd('message', 1000) - explicit message, default green type, explicit delay
 *  notificationsAdd('message', 'error', 1000) - explicit message, explicit green type, explicit delay
 *  notificationsAdd({ // or pass an object
 *      msg: 'message',
 *      type: 'error',
 *      time: 5000
 *  }) - explicit message, default green type, default delay
 */
export const notificationsAdd = async (...args) => {

  const id = generateId();

  let payload = {...def};

  let firstString = true;

  args.forEach(arg => {
    if (isObject(arg)) {
      payload = {...payload, ...arg};
    }
    else if (Number.isInteger(arg)) {
      payload.time = arg;
    }
    else {
      if (firstString) {
        payload = {
          ...payload,
          msg: (typeof arg === 'string') ? arg : JSON.stringify(arg)
        }
        firstString = false;
      }
      else {
        payload = {
          ...payload,
          type: (typeof arg === 'string') ? arg : JSON.stringify(arg)
        }
      }
    }
  });

  payload.id = id;

  if (payload.time < animationTime) {

    payload.time = animationTime;
  }

  dispatch({
    type: NOTIFICATIONS_ADD,
    payload
  });

  await wait(50);

  dispatch({
    type: NOTIFICATIONS_UPDATE,
    payload : {
      ...payload,
      type:payload.type + ' show'
    }
  })

  await wait(payload.time);

  return await notificationsRemove(id);
};

try {

  window.notificationsAdd    = notificationsAdd;

  window.notificationsRemove = notificationsRemove;
}
catch (e) {

}

export const getNotificationsState = () => state;