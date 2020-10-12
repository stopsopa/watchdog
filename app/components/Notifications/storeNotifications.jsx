
import React, {
  createContext,
  useReducer,
} from 'react';

export const NOTIFICATION_ADD      = 'NOTIFICATION_ADD';
export const NOTIFICATION_REMOVE     = 'NOTIFICATION_REMOVE';
export const NOTIFICATION_UPDATE   = 'NOTIFICATION_UPDATE';

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
    case NOTIFICATION_ADD:
      return [...[action.payload], ...state];
    case NOTIFICATION_REMOVE:
      return state.filter(item => (item.id !== action.payload));
    case NOTIFICATION_UPDATE:
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

export const notificationsRemove = id => {

  const list = getNotificationsState();

  const found = (list || []).find(item => (item.id == id));

  return new Promise(resolve => {

    if ( ! found ) {

      return resolve();
    }

    const payload = { ...found };

    payload.type = payload.type.replace(/(\s|^)show(\s|$)/g, ' ');

    dispatch({
      type: NOTIFICATION_UPDATE,
      payload : {
        ...payload,
        type:payload.type + ' hide show'
      }
    });

    setTimeout(() => dispatch({
      type: NOTIFICATION_UPDATE,
      payload : {
        ...payload,
        type:payload.type + ' hide'
      }
    }), delay);

    setTimeout(() => {

      dispatch({
        type: NOTIFICATION_REMOVE,
        payload: id
      });

      resolve(payload);

    }, animationTime + (3 * delay) );
  });
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
export const notificationsAdd = (...args) => {

  getNotificationsState();

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
    type: NOTIFICATION_ADD,
    payload
  });

  setTimeout(() => dispatch({
    type: NOTIFICATION_UPDATE,
    payload : {
      ...payload,
      type:payload.type + ' show'
    }
  }), 50);

  return new Promise(resolve => setTimeout(
    () => dispatch(notificationsRemove(id)).then(resolve),
    payload.time
  ));
};

try {

  window.notificationsAdd    = notificationsAdd;

  window.notificationsRemove = notificationsRemove;
}
catch (e) {

}

export const getNotificationsState = () => state;