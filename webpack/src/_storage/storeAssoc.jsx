
import React, {
  createContext,
  useReducer,
} from 'react';

import log from 'inspc';

/**
 *
 *
  import { StoreAssocProvider } from './_storage/storeAssoc';

  render(
    (
      <StoreAssocProvider>
      <App />
      </StoreAssocProvider>
    ),
    document.getElementById('app')
  );

 *
 *
 * NOTICE: IDE completion works with this one better
 *
  import {
    StoreContext as StoreContextAssoc,
    setStoreAssocSet,
  } from './_storage/storeAssoc';

  const {
    state: stateAssoc,
  } = React.useContext(StoreContextAssoc);

 or...

 import * as storeAssoc from './_storage/storeAssoc';

 const {
    state: stateAssoc,
    setStoreAssocSet,
  } = React.useContext(storeAssoc.StoreContext);
 */

export const StoreContext = createContext();

const th = (function () {
  const name = __filename.split('/').pop().split('.').shift();
  StoreContext.displayName = `${name}_context`;
  StoreAssocProvider.displayName = `${name}_component`;
  return msg => {
    let data = '';
    if (arguments.length > 1) data = `, data: >>>${JSON.stringify(arguments[1], null, 4)}<<<`;
    return new Error(`${name} context error: ${msg}${data}`)
  }
}());

const initialState = {
  assoc: {},
};

let state, dispatch;

export function StoreAssocProvider(props) {

  [state, dispatch] = useReducer(reducer, initialState);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
    setStoreAssocSet,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

import {
  ASSOC_SET,
  ASSOC_DELETE,
} from './_types';

function reducer(state, action) {
  switch (action.type) {
    case ASSOC_SET:
      if ( typeof action.key !== 'string' ) {

        throw th(`action.key !== 'string'`, action.key);
      }
      if ( ! action.key.trim() ) {

        throw th(`action.key is an empty 'string'`, action.key);
      }
      return { ...state, assoc: { ...state.assoc, [action.key]: action.value } };
    default:
      return state;
  }
}

// actions && selectors:

export const setStoreAssocSet = async (key, value) => {

  dispatch({
    type: ASSOC_SET,
    key,
    value,
  });
}