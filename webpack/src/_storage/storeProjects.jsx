
import React, {
  createContext,
  useReducer,
} from 'react';

import log from 'inspc';

/**
 *
 import {
    StoreContext as StoreContextProjects,
  } from './_storage/storeProjects';

 const {
    state: stateProjects,
  } = React.useContext(StoreContextProjects);
 */

export const StoreContext = createContext();

const th = (function () {
  const name = __filename.split('/').pop().split('.').shift();
  StoreContext.displayName = `${name}_context`;
  StoreProjectsProvider.displayName = `${name}_component`;
  return msg => {
    let data = '';
    if (arguments.length > 1) data = `, data: >>>${JSON.stringify(arguments[1], null, 4)}<<<`;
    return new Error(`${name} context error: ${msg}${data}`)
  }
}());

const initialState = {
  projects: [],
};

let state, dispatch;

export function StoreProjectsProvider(props) {

  [state, dispatch] = useReducer(reducer, initialState);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
    fetchDataAction,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

import {
  PROJECTS_POPULATE,
} from './_types';

function reducer(state, action) {
  switch (action.type) {
    case PROJECTS_POPULATE:
      return { ...state, projects: action.payload };
    default:
      return state;
  }
}

// actions && selectors:

export const fetchDataAction = async () => {

  setTimeout(() => {
    dispatch({
      type: PROJECTS_POPULATE,
      payload: ['proj 1', 'proj 2']
    })
  }, 1000);
};