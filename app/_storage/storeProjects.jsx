
import React, {
  createContext,
  useReducer,
  useContext,
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

        import * as storeSocket from './storeSocket';

        let socket;

export function StoreProjectsProvider(props) {

          ({ state: socket } = useContext(storeSocket.StoreContext));

  [state, dispatch] = useReducer(reducer, initialState);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
    actionProjectsGetList,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

import {
  PROJECTS_POPULATE_LIST,
} from './_types';

function reducer(state, action) {
  switch (action.type) {
    case PROJECTS_POPULATE_LIST:
      return { ...state, projects: action.payload };
    default:
      return state;
  }
}

// actions && selectors:

export const actionProjectsGetList = ({
  socket,
}) => {

  socket.emit('projects_populate_list');

  const projects_populate_list = ({
    list,
  }) => {

    dispatch({
      type: PROJECTS_POPULATE_LIST,
      payload: list,
    })
  }

  socket.on('projects_populate_list', projects_populate_list);

  return () => {

    socket.off('projects_populate_list', projects_populate_list);
  }
};

export const getProjectList = () => {
  return state.projects;
}