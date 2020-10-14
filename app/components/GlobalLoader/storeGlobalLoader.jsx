
import React, {
  createContext,
  useReducer,
} from 'react';

import wait from 'nlab/delay';

import combineReducers from 'nlab/combineReducers';

export const GLOBAL_LOADER_ON            = 'GLOBAL_LOADER_ON';
export const GLOBAL_LOADER_OFF           = 'GLOBAL_LOADER_OFF';
export const GLOBAL_LOADER_ERROR         = 'GLOBAL_LOADER_ERROR';
export const GLOBAL_LOADER_MESSAGE       = 'GLOBAL_LOADER_MESSAGE';

export const StoreContext = createContext();

const th = (function () {
  const name = __filename.split('/').pop().split('.').shift();
  StoreContext.displayName = `${name}_context`;
  StoreGlobalLoaderProvider.displayName = `${name}_component`;
  return msg => {
    let data = '';
    if (arguments.length > 1) data = `, data: >>>${JSON.stringify(arguments[1], null, 4)}<<<`;
    return new Error(`${name} context error: ${msg}${data}`)
  }
}());

const initialState = {
  status: 'off',
  msg: '',
};

const status = (state = initialState.status, action) => {
  switch (action.type) {
    case GLOBAL_LOADER_ON:
      return 'on';
    case GLOBAL_LOADER_ERROR:
      return 'err';
    case GLOBAL_LOADER_OFF:
      return 'off';
    case GLOBAL_LOADER_MESSAGE:
      return 'msg';
    default:
      return state;
  }
}

const msg = (state = initialState.msg, action) => {
  switch (action.type) {
    case GLOBAL_LOADER_ERROR:
    case GLOBAL_LOADER_MESSAGE:
      return action.msg;
    default:
      return state;
  }
}

const reducer = combineReducers({
  status,
  msg,
});

let state, dispatch;

export function StoreGlobalLoaderProvider(props) {

  [state, dispatch] = useReducer(reducer, initialState);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
  }}>{props.children}</StoreContext.Provider>);
}

export const actionGlobalLoaderOn = () => {
  dispatch({ type: GLOBAL_LOADER_ON })
};

export const actionGlobalLoaderOff = async (delay = 0) => {

  await wait(delay);

  dispatch({
    type: GLOBAL_LOADER_OFF
  });
};

const definition = function (type) {

  let handler = null;

  return async (msg, time, delay = 100) => {

    await wait(delay);

    dispatch({
      type,
      msg
    });

    clearTimeout(handler);

    if ( ! Number.isInteger(time) ) { // never hide, only on demand/manually

      return;
    }

    handler = setTimeout(() => {

      dispatch(actionGlobalLoaderOff());

    // }, time || 50000);
    }, time || 1000);
  };
};

export const actionGlobalLoaderError    = definition(GLOBAL_LOADER_ERROR);

export const actionGlobalLoaderMessage  = definition(GLOBAL_LOADER_MESSAGE);

try {

  window.actionGlobalLoaderMessage  = actionGlobalLoaderMessage;

  window.actionGlobalLoaderError    = actionGlobalLoaderError;

  window.actionGlobalLoaderOn    = actionGlobalLoaderOn;

  window.actionGlobalLoaderOff    = actionGlobalLoaderOff;
}
catch (e) {

}

export const getGlobalLoaderStatus          = () => state.status;

export const getGlobalLoaderMsg             = () => state.msg;

export const getGlobalLoaderLoading         = () => getGlobalLoaderStatus() === 'on';