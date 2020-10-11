
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
  form: {},
  errors: {},
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
    actionProjectsListPopulate,
    actionProjectsFormReset,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

import {
  PROJECTS_LIST_POPULATE,
  PROJECTS_FORM_POPULATE,
  PROJECTS_FORM_RESET,
  PROJECTS_FORM_EDIT_FIELD,
  PROJECTS_ERRORS_POPULATE,
} from './_types';

function reducer(state, action) {
  switch (action.type) {
    case PROJECTS_LIST_POPULATE:
      return {
        ...state,
        projects: action.payload
      };
    case PROJECTS_FORM_POPULATE:
      return {
        ...state,
        form: action.payload
      };
    case PROJECTS_FORM_RESET:
      return {
        ...state,
        form: {},
        errors: {},
      };
    case PROJECTS_FORM_EDIT_FIELD:
      return {
        ...state,
        form: {
          ...state.form,
          [action.key]: action.value,
        },
      };
    case PROJECTS_ERRORS_POPULATE:
      return {
        ...state,
        errors: action.payload
      };
    default:
      return state;
  }
}

// actions && selectors:

export const actionProjectsListPopulate = () => {

  socket.emit('projects_list_populate');

  const projects_list_populate = ({
    list,
  }) => {

    dispatch({
      type: PROJECTS_LIST_POPULATE,
      payload: list,
    })
  }

  socket.on('projects_list_populate', projects_list_populate);

  return () => {

    socket && socket.off('projects_list_populate', projects_list_populate);
  }
};

export const actionProjectsFormPopulate = ({
  id,
  onLoad,
}) => {

  actionProjectsFormReset()

  socket.emit('projects_form_populate', id);

  const projects_form_populate = ({
    form,
    errors,
  }) => {

    dispatch({
      type: PROJECTS_FORM_POPULATE,
      payload: form,
    });

    if ( typeof errors !== 'undefined' ) {

      dispatch({
        type: PROJECTS_ERRORS_POPULATE,
        payload: errors,
      });
    }

    onLoad();
  }

  socket.on('projects_form_populate', projects_form_populate);

  return () => {

    socket && socket.off('projects_form_populate', projects_form_populate);
  }
};

export const actionProjectsFormSubmit = ({
  form,
}) => {

  socket.emit('projects_form_submit', form);
};

export const actionProjectsFormReset = () => {
  dispatch({ type: PROJECTS_FORM_RESET })
};

export const actionProjectsFormEditField = (key, value) => {
  dispatch({
    type: PROJECTS_FORM_EDIT_FIELD,
    key,
    value,
  })
};

export const getProjectList = () => {
  return state.projects;
}

export const getProjectForm = () => {
  return state.form;
}

export const getProjectFormErrors = () => {
  return state.errors;
}