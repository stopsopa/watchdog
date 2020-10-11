
import React, {
  createContext,
  useReducer,
} from 'react';

import combineReducers from 'nlab/combineReducers';

export const LOADER_ON      = 'LOADER_ON';
export const LOADER_OFF     = 'LOADER_OFF';
export const LOADER_ERROR   = 'LOADER_ERROR';
export const LOADER_MESSAGE = 'LOADER_MESSAGE';
export const LOADER_BUTTONS_SHOW = 'LOADER_BUTTONS_SHOW';
export const LOADER_BUTTONS_HIDE = 'LOADER_BUTTONS_HIDE';

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
  show: false,
};

const status = (state = initialState.status, action) => {
  switch (action.type) {
    case LOADER_ON:
      return 'on';
    case LOADER_ERROR:
      return 'err';
    case LOADER_OFF:
      return 'off';
    case LOADER_MESSAGE:
      return 'msg';
    default:
      return state;
  }
}

const msg = (state = initialState.msg, action) => {
  switch (action.type) {
    case LOADER_ERROR:
    case LOADER_MESSAGE:
      return action.msg;
    default:
      return state;
  }
}

const show = (state = initialState.show, action) => {
  switch (action.type) {
    case LOADER_BUTTONS_SHOW:
      return true;
    case LOADER_BUTTONS_HIDE:
      return false;
    default:
      return state;
  }
}

const reducer = combineReducers({
  status,
  msg,
  show
});

let state, dispatch;

export function StoreGlobalLoaderProvider(props) {

  [state, dispatch] = useReducer(reducer, initialState);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
  }}>{props.children}</StoreContext.Provider>);
}

export const loaderOff = (delay = 0) => setTimeout(() => dispatch({
  type: LOADER_OFF
}), delay);


const definition = function (type) {

  let handler = null;

  return (msg, time, delay = 100) => setTimeout(() => {

    dispatch({
      type,
      msg
    });

    clearTimeout(handler);

    handler = setTimeout(() => {

      dispatch(loaderOff());

    }, time || 50000);
  }, delay);
};

export const loaderError    = definition(LOADER_ERROR);

export const loaderMessage  = definition(LOADER_MESSAGE);

try {

  window.loaderMessage  = loaderMessage;

  window.loaderError    = loaderError;
}
catch (e) {

}

export const loaderButtonsShow = () => {
  dispatch({ type: LOADER_BUTTONS_SHOW })
};

export const loaderButtonsHide = () => {
  dispatch({ type: LOADER_BUTTONS_HIDE })
};

export const loaderOn = () => {
  dispatch({ type: LOADER_ON })
};

export const getLoaderStatus        = () => state.status;

export const getLoaderMsg           = () => state.msg;

export const getLoading             = () => getLoaderStatus() === 'on';

export const getLoaderButtonVisible = () => state.show;