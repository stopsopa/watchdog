
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
  projects: {
    list: [],
    form: {},
    errors: {},
  },
  probes: {
    list: [],
    form: {},
    errors: {},
    testResult: null,
  }
};

let state, dispatch;

import * as storeSocket from '../../_storage/storeSocket';

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

export const PROBES_LIST_POPULATE     = 'PROBES_LIST_POPULATE';
export const PROBES_FORM_POPULATE     = 'PROBES_FORM_POPULATE';
export const PROBES_FORM_RESET        = 'PROBES_FORM_RESET';
export const PROBES_FORM_FIELD_EDIT   = 'PROBES_FORM_FIELD_EDIT';
export const PROBES_ERRORS_POPULATE   = 'PROBES_ERRORS_POPULATE';

export const PROBES_SET_TEST_RESULT   = 'PROBES_SET_TEST_RESULT';

function projectsList(state = initialState.projects.list, action) {
  switch (action.type) {
    case PROJECTS_LIST_POPULATE:
      return action.payload;
    default:
      return state;
  }
}

function projectsForm(state = initialState.projects.form, action) {
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

function projectsErrors(state = initialState.projects.errors, action) {
  switch (action.type) {
    case PROJECTS_FORM_RESET:
      return {};
    case PROJECTS_ERRORS_POPULATE:
      return action.payload;
    default:
      return state;
  }
}

function probesList(state = initialState.probes.list, action) {
  switch (action.type) {
    case PROBES_LIST_POPULATE:
      return action.payload;
    default:
      return state;
  }
}

function probesForm(state = initialState.probes.form, action) {
  switch (action.type) {
    case PROBES_FORM_POPULATE:
      return action.payload;
    case PROBES_FORM_RESET:
      return {};
    case PROBES_FORM_FIELD_EDIT:
      return {
        ...state,
        [action.key]: action.value,
      };
    default:
      return state;
  }
}

function probesErrors(state = initialState.probes.errors, action) {
  switch (action.type) {
    case PROBES_FORM_RESET:
      return {};
    case PROBES_ERRORS_POPULATE:
      return action.payload;
    default:
      return state;
  }
}

function testResult(state = null, action) {
  switch (action.type) {
    case PROBES_SET_TEST_RESULT:
      return action.value;
    default:
      return state;
  }
}

const reducer = combineReducers({
  projects: combineReducers({
    list    : projectsList,
    form    : projectsForm,
    errors  : projectsErrors,
  }),
  probes: combineReducers({
    list    : probesList,
    form    : probesForm,
    errors  : probesErrors,
    testResult,
  }),
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
  onLoad = () => {},
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



// probes



export const actionProbesFormPopulate = ({
  project_id:
  probe_id,
  type,
  onLoad = () => {},
}) => {

  actionProbesFormReset();

  socket.emit('probes_form_populate', {
    project_id:
    probe_id,
    type,
  });

  const probes_form_populate = data => {

    const {
      form,
      errors,
    } = data;

    dispatch({
      type: PROBES_FORM_POPULATE,
      payload: form,
    });

    if ( typeof errors !== 'undefined' ) {

      dispatch({
        type: PROBES_ERRORS_POPULATE,
        payload: errors,
      });
    }

    onLoad(data);
  }

  socket.on('probes_form_populate', probes_form_populate);

  const probes_run_code = data => actionProbesSetTestResult(data);

  socket.on('probes_run_code', probes_run_code);

  return () => {

    if (socket) {

      socket.off('probes_form_populate', probes_form_populate);

      socket.off('probes_run_code', probes_run_code);
    }
  }
};

export const actionProbesFormSubmit = ({
  form,
}) => {

  socket.emit('probes_form_submit', form);
};

export const actionProbesFormReset = () => {
  dispatch({ type: PROBES_FORM_RESET })
};

export const actionProbesSetTestResult = value => {
  dispatch({
    type: PROBES_SET_TEST_RESULT,
    value
  })
};

export const actionProbesFormFieldEdit = (key, value) => {
  dispatch({
    type: PROBES_FORM_FIELD_EDIT,
    key,
    value,
  })
};

export const actionProbesRunCode = (code, type) => {

  actionProbesSetTestResult('executing');

  socket.emit('probes_run_code', {
    code,
    type,
  });
};


// projects
export const getProjectList = () => {
  return state.projects.list;
}

export const getProjectForm = () => {
  return state.projects.form;
}

export const getProjectFormErrors = () => {
  return state.projects.errors;
}

// probes

export const getProbesList = () => {
  return state.probes.list;
}

export const getProbesForm = () => {
  return state.probes.form;
}

export const getProbesFormErrors = () => {
  return state.probes.errors;
}

export const getProbesTestResult = () => {
  return state.probes.testResult;
}