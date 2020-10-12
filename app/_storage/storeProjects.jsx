
import React, {
  createContext,
  useReducer,
  useContext,
} from 'react';

import combineReducers from 'nlab/combineReducers'

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

export const PROJECTS_LIST_POPULATE     = 'PROJECTS_LIST_POPULATE';
export const PROJECTS_FORM_POPULATE     = 'PROJECTS_FORM_POPULATE';
export const PROJECTS_FORM_RESET        = 'PROJECTS_FORM_RESET';
export const PROJECTS_FORM_FIELD_EDIT   = 'PROJECTS_FORM_FIELD_EDIT';
export const PROJECTS_ERRORS_POPULATE   = 'PROJECTS_ERRORS_POPULATE';

function projects(state = initialState.projects, action) {
  switch (action.type) {
    case PROJECTS_LIST_POPULATE:
      return action.payload;
    default:
      return state;
  }
}

function form(state = initialState.form, action) {
  switch (action.type) {
    case PROJECTS_FORM_POPULATE:
      return action.payload;
    case PROJECTS_FORM_RESET:
      return {};
    case PROJECTS_FORM_FIELD_EDIT:
      return {
        ...state,
        [action.key]: action.value,
      };
    default:
      return state;
  }
}

function errors(state = initialState.errors, action) {
  switch (action.type) {
    case PROJECTS_FORM_RESET:
      return {};
    case PROJECTS_ERRORS_POPULATE:
      return action.payload;
    default:
      return state;
  }
}

const reducer = combineReducers({
  projects,
  form,
  errors,
});

// actions && selectors:

export const actionProjectsDelete = id => {

  socket.emit('projects_delete', id);
};

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

  actionProjectsFormReset();

  socket.emit('projects_form_populate', id);

  const projects_form_populate = data => {

    const {
      form,
      errors,
    } = data;

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

    onLoad(data);
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

export const actionProjectsFormFieldEdit = (key, value) => {
  dispatch({
    type: PROJECTS_FORM_FIELD_EDIT,
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