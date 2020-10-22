
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
} from 'react';

import log from 'inspc';

import get from 'nlab/get';

import set from 'nlab/set';

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
    setStoreAssoc,
  } from './_storage/storeAssoc';

  const {
    state: stateAssoc,
  } = React.useContext(StoreContextAssoc);

 or...

 import * as storeAssoc from './_storage/storeAssoc';

 const {
    state: stateAssoc,
    setStoreAssoc,
  } = React.useContext(storeAssoc.StoreContext);
 */

import {
  notificationsAdd,
} from '../components/Notifications/storeNotifications';

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

  import * as storeSocket from '../_storage/storeSocket';

  let socket;

export function StoreAssocProvider(props) {

      ({ state: socket } = useContext(storeSocket.StoreContext));

  [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {

    if (socket) {

      socket.on('status_all_probes', ({
        list,
      }) => {

        setStoreAssoc('status', list);
      })

    }
    else {
      log.dump('StoreAssocProvider socket not available yet')
    }
  }, [socket]);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
    setStoreAssoc,
  }}>{props.children}</StoreContext.Provider>);
}

// reducer:

// import {
//   ASSOC_SET,
//   ASSOC_DELETE,
// } from './_types';

export const ASSOC_SET      = 'ASSOC_SET';
export const ASSOC_DELETE   = 'ASSOC_DELETE';

function reducer(state, action) {
  switch (action.type) {
    case ASSOC_SET:
      if ( typeof action.key !== 'string' ) {

        throw th(`ASSOC_SET action.key !== 'string'`, action.key);
      }
      if ( ! action.key.trim() ) {

        throw th(`ASSOC_SET action.key is an empty 'string'`, action.key);
      }

      state = {
        ...state,
        assoc: {...state.assoc},
      }

      set(state.assoc, action.key, action.value);

      return state;
    case ASSOC_DELETE:
      if ( typeof action.key !== 'string' ) {

        throw th(`ASSOC_DELETE action.key !== 'string'`, action.key);
      }
      if ( ! action.key.trim() ) {

        throw th(`ASSOC_DELETE action.key is an empty 'string'`, action.key);
      }

      state = {
        ...state,
        assoc: {...state.assoc},
      }

      set(state.assoc, action.key, undefined);

      return state;
    default:
      return state;
  }
}

// actions && selectors:

export const setStoreAssoc = (key, value) => {

  if ( typeof key !== 'string') {

    throw th(`setStoreAssoc key is not a string`);
  }

  if ( ! key.trim() ) {

    throw th(`setStoreAssoc key.trim() is an empty string`);
  }

  dispatch({
    type: ASSOC_SET,
    key,
    value,
  });
}

export const setStoreAssocDelete = key => {

  if ( typeof key !== 'string') {

    throw th(`setStoreAssocDelete key is not a string`);
  }

  if ( ! key.trim() ) {

    throw th(`setStoreAssocDelete key.trim() is an empty string`);
  }

  dispatch({
    type: ASSOC_DELETE,
    key,
  });
}

export const getStoreAssoc = key => {

  if ( typeof key !== 'string') {

    throw th(`getStoreAssoc key is not a string`);
  }

  if ( ! key.trim() ) {

    throw th(`getStoreAssoc key.trim() is an empty string`);
  }

  return get(state.assoc, key);
}

/// from this point all below is customised for this project
/// from this point all below is customised for this project
/// from this point all below is customised for this project
/// from this point all below is customised for this project
/// from this point all below is customised for this project
/// from this point all below is customised for this project
/// from this point all below is customised for this project
/// from this point all below is customised for this project

export const getStatusProbe = id => {

  try {

    if (getStoreAssoc(`status.${id}.db.enabled`) === false) {

      return 'disabled'
    }

    const probe = getStoreAssoc(`status.${id}.probe`);

    if (typeof probe === 'boolean') {

      return probe ? 'ok' : 'error';
    }
  }
  catch (e) {

    log.dump({
      getStatusProbe_catch_error: e,
      probe_id: id,
    })
  }

  return 'unknown';
}

export const getStatusPoject = id => {

  // log.dump({
  //   projects: getStoreAssoc(`status`)
  // })

  const list = getStoreAssoc(`status`);

  try {

    const keys = Object.keys(list);

    let error = 0;

    let probesInThisProject = 0;

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if (t.db.project_id !== id) {

        continue;
      }

      probesInThisProject += 1;

      if (t.db.enabled === false) {

        continue;
      }

      if (typeof t.probe !== 'boolean') {

        return 'error';
      }

      if ( !t.probe ) {

        error += 1;
      }
    }

    if (probesInThisProject && error) {

      return error;
    }

    return 'ok'

  }
  catch (e) {

    log.dump({
      getStatusPoject_catch_error: e,
      project_id: id,
      list,
    });
  }

  return 'unknown';
}

export const getStatusFavicon = () => {

  const list = getStoreAssoc(`status`);

  if (list === undefined) {

    return {
      status: 'error', // ok, error
      text: 'OFF', // offline
    };
  }

  try {

    const keys = Object.keys(list);

    let error = 0;

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if (t.db.enabled === false) {

        continue;
      }

      if (typeof t.probe !== 'boolean') {

        return {
          status: 'error', // ok, error
          text: 'PE', // probe error
        };
      }

      if ( ! t.probe ) {

        error += 1;
      }
    }

    if (error) {

      return {
        status: 'error', // ok, error
        text: String(error),
      };
    }

    return {
      status: 'ok', // ok, error
      text: 'OK',
    };

  }
  catch (e) {

    log.dump({
      getStatusFavicon_catch_error: e,
      data: list,
    });

    return {
      status: 'error', // ok, error
      text: 'GE',  // general error
    };
  }
}

export const setStatusReset = () => setStoreAssocDelete(`status`);


export const actionFetchFullRangeStats = ({
  probe_id,
  startDate,
  endDate,
  key,
  onLoad = () => {},
}) => {

  // log.dump({
  //   actionFetchFullRangeStats: {
  //     probe_id,
  //     startDate,
  //     endDate,
  //   }
  // });

  socket.emit('probes_logs_full', {
    probe_id,
    startDate,
    endDate,
  });

  const probes_logs_full = data => {

    const {
      list,
    } = data ||  {}

    setStoreAssoc(key, list);

    // onLoad(data);
  }

  const probes_logs_selection = data => {

    const {
      list = [],
      key,
      error,
    } = data ||  {}

    if (error) {

      notificationsAdd(String(error), 'error');
    }

    log.dump({
      probes_logs_selection: {
        key,
        list,
      }
    })
    setStoreAssoc(key, list);

    // onLoad(data);
  }

  const probes_logs_selected_log = data => {

    log.dump({
      probes_logs_selected_log: data,
    })

    const {
      log: logg,
      key,
    } = data ||  {}

    setStoreAssoc(key, logg);

    // onLoad(data);
  }

  socket.on('probes_logs_full', probes_logs_full);

  socket.on('probes_logs_selection', probes_logs_selection);

  socket.on('probes_logs_selected_log', probes_logs_selected_log);

  // const probes_run_code = data => actionProbesSetTestResult(data);
  //
  // socket.on('probes_run_code', probes_run_code);

  return () => {

    if (socket) {

      socket.off('probes_logs_full', probes_logs_full);

      socket.off('probes_logs_selection', probes_logs_selection);

      socket.off('probes_logs_selected_log', probes_logs_selected_log);

      // socket.off('probes_run_code', probes_run_code);
    }
  }
};

export const actionFetchSelectedLog = ({
  log_id,
  key,
}) => {

  setStoreAssoc(key, null);

  socket.emit('probes_logs_selected_log', {
    log_id,
    key,
  });
};

export const actionFetchSelectionStats = ({
  probe_id,
  startDate,
  endDate,
  key,
}) => {

  setStoreAssoc(key, null);

  socket.emit('probes_logs_selection', {
    probe_id,
    startDate,
    endDate,
    key,
  });
};

export const actionDeleteSelectedLog = ({
  log_id,
  probe_id,
  startDate,
  endDate,
  key,
}) => {

  setStoreAssoc(key, null);

  socket.emit('probes_delete_selected_log', {
    log_id,
    probe_id,
    startDate,
    endDate,
    key,
  });
};