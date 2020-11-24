
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
} from 'react';

import log from 'inspc';

import get from 'nlab/get';

import set from 'nlab/set';

import del from 'nlab/del';

const assocKeySelection     = 'log_selection';

const assocKeyFullRange     = 'log_full_range';

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

      const unmout = [];

      (function () {

        const status_all_probes = ({
          list,
        }) => {

          setStoreAssoc('status', list);
        }

        socket.on('status_all_probes', status_all_probes)

        unmout.push(() => socket.off('status_all_probes', status_all_probes))
      }());

      (function () {

        const probe_status_destruct = id => {

          setStoreAssocDelete(`status.${id}`);
        }

        socket.on('probe_status_destruct', probe_status_destruct)

        unmout.push(() => socket.off('probe_status_destruct', probe_status_destruct))
      }());

      (function () {

        const probe_status_update = ({
          state,
          esid,
        }) => {

          setStoreAssoc(`status.${state.db.id}`, state);

          const probe_id = getStoreAssoc('log_page_current_probe_id');

          if (state.db.id === probe_id) {

            let current = getStoreAssoc(assocKeyFullRange) || []

            current.push({
              f: state.lastTimeLoggedInEsUnixtimestampMilliseconds_ISOString,
              p: state.probe,
              l: true // live
            });

            if (current.length > 10000) {

              current = current.splice(current.length - 10000)
            }

            setStoreAssoc(assocKeyFullRange, current);

            if (esid) {

              current = getStoreAssoc(assocKeySelection) || [];

              current.push({
                id: esid,
                f: state.lastTimeLoggedInEsUnixtimestampMilliseconds_ISOString,
                p: state.probe,
                l: true // live
              })

              if (current.length > 10000) {

                current = current.splice(current.length - 10000)
              }

              setStoreAssoc(assocKeySelection, current);
            }
          }
          else {

            // log.dump({
            //   probes_logs_full_live: {
            //     probe_id,
            //     different_probe: live_log,
            //   }
            // })
          }
        }

        socket.on('probe_status_update', probe_status_update)

        unmout.push(() => socket.off('probe_status_update', probe_status_update))
      }());

      (function () {

        const probe_status_delete = id => {

          setStoreAssocDelete(`status.${id}`);
        }

        socket.on('probe_status_delete', probe_status_delete)

        unmout.push(() => socket.off('probe_status_delete', probe_status_delete))
      }());

      return () => {

        while (unmout.length) {

          unmout.pop()();
        }
      }
    }
    else {
      log.dump('StoreAssocProvider socket not available yet')
    }
  }, [socket ? socket.id : undefined]);

  return (<StoreContext.Provider value={{
    state,
    dispatch,
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

      del(state.assoc, action.key);

      return state;
    default:
      return state;
  }
}

export const getSocket = () => socket;

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

export const getStoreAssoc = (key, def) => {

  if ( typeof key !== 'string') {

    throw th(`getStoreAssoc key is not a string`);
  }

  if ( ! key.trim() ) {

    throw th(`getStoreAssoc key.trim() is an empty string`);
  }

  return get(state.assoc, key, def);
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

  let status;

  let state = getStoreAssoc(`status.${id}`);

  try {

    if (state.db.enabled === false) {

      status = 'disabled'

      return {
        status,
        state,
      }
    }

    if (typeof state.probe === 'boolean') {

      status = state.probe ? 'ok' : 'error';

      return {
        status,
        state,
      }
    }
  }
  catch (e) {

    log.dump({
      getStatusProbe_catch_error: e,
      probe_id: id,
    })
  }

  return {
    status: 'unknown',
    state,
  }
}

export const getStatusPoject = (id, debug = false) => {

  let state = {};

  const list = getStoreAssoc(`status`);

  // const p = []

  try {

    const keys = Object.keys(list);

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if (t.db.project_id !== id) {

        // debug && console.log(JSON.stringify({SKIP: {pid: t.db.project_id, m: t.nextTriggerFromNowMilliseconds}}))

        continue;
      }

      if (t.db.enabled === false) {

        // debug && console.log(JSON.stringify({DISA: {pid: t.db.project_id, m: t.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds}}))

        continue;
      }

      // p.push({
      //   i,
      //   t
      // })

      try {

        if (
          Number.isInteger(t.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds) &&
          t.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds > 0 &&
          (
            state.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds === undefined ||
            state.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds > t.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds
          )
        ) {

          // debug && console.log(JSON.stringify({IFIF: {i,id:t.db.id,s: state.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds, t: t.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds}}))

          state = {...t};
        }
        else {

          // debug && console.log(JSON.stringify({ELSE: {i,id:t.db.id,s: state.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds, t: t.nextTriggerRelativeToLastEsLogAfterApplyingIntervalUnixtimestampMilliseconds}}))
        }
      }
      catch (e) {

        // debug && console.log(`err: ${e.message}`)
      }
    }

    // debug && console.log({
    //   state,
    //   p
    // })

    let probesInThisProject = 0;

    let error = 0;

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if (t.probe === null) {

        continue;
      }

      if (t.db.project_id !== id) {

        continue;
      }

      probesInThisProject += 1;

      if (t.db.enabled === false) {

        continue;
      }

      if (typeof t.probe !== 'boolean') {

        return {
          status: 'error',
          state,
        }
      }

      if ( !t.probe ) {

        error += 1;
      }
    }

    if (probesInThisProject && error) {

      return {
        status: error,
        state,
      }
    }


    return {
      status: 'ok',
      state,
    }
  }
  catch (e) {

    // log.dump({
    //   getStatusPoject_catch_error: e,
    //   project_id: id,
    //   list,
    // });
  }

  return {
    status: 'unknown',
    state,
  }
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

      if (t.probe === null) {

        continue;
      }

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
export const getProjectInArchiveMode = id => {

  const list = getStoreAssoc(`status`);

  try {

    const keys = Object.keys(list);

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if ( ! t.db || ! t.db.project_id || t.db.project_id !== id ) {

        continue;
      }

      if ( t.db.detailed_log ) {

        return true;
      }
    }
  }
  catch (e) {

    log.dump({
      getProjectInArchiveMode_catch_error: e,
      project_id: id,
      list,
    });
  }

  return false;
}
export const getProjectInServiceMode = id => {

  const list = getStoreAssoc(`status`);

  try {

    const keys = Object.keys(list);

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if ( ! t.db || ! t.db.project_id || t.db.project_id !== id ) {

        continue;
      }

      if ( t.db.service_mode ) {

        return true;
      }
    }
  }
  catch (e) {

    log.dump({
      getProjectInAServiceMode_catch_error: e,
      project_id: id,
      list,
    });
  }

  return false;
}

export const getProjectInNotAllEnabledMode = id => {

  const list = getStoreAssoc(`status`);

  try {

    const keys = Object.keys(list);

    for (let i = 0, l = keys.length, t ; i < l ; i += 1 ) {

      t = list[keys[i]];

      if ( ! t.db || ! t.db.project_id || t.db.project_id !== id ) {

        continue;
      }

      if ( ! t.db.enabled ) {

        return true;
      }
    }
  }
  catch (e) {

    log.dump({
      getProjectInNotAllEnabledMode_catch_error: e,
      project_id: id,
    });
  }

  return false;
}

export const setStatusReset = () => setStoreAssocDelete(`status`);

export const actionFetchFullRangeStats = ({
  probe_id,
  startDate,
  endDate,
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

  setStoreAssoc('log_page_current_probe_id', probe_id);

  const probes_logs_full = data => {

    const {
      list,
    } = data ||  {}

    setStoreAssoc(assocKeyFullRange, list);
  }
  socket.on('probes_logs_full', probes_logs_full);

  const probes_logs_selection = data => {

    const {
      list = [],
      error,
    } = data ||  {}

    if (error) {

      notificationsAdd(String(error), 'error');
    }

    setStoreAssoc(assocKeySelection, list);
  }
  socket.on('probes_logs_selection', probes_logs_selection);

  const probes_logs_selected_log = data => {

    const {
      log: logg,
      key,
    } = data ||  {}

    setStoreAssoc(key, logg);

    // onLoad(data);
  }
  socket.on('probes_logs_selected_log', probes_logs_selected_log);

  // const probes_run_code = data => actionProbesSetTestResult(data);
  //
  // socket.on('probes_run_code', probes_run_code);

  return () => {

    if (socket) {

      setStoreAssocDelete('log_page_current_probe_id')

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


export const actionUsersListPopulate = ({
  onLoad = () => {},
  users_delete = () => {},
  key,
}) => {

  if ( typeof key !== 'string') {

    throw th(`actionUsersListPopulate key is not a string`);
  }

  setStoreAssocDelete(key);

  socket.emit('users_list_populate');

  users_delete && socket.on('users_delete', users_delete);

  const users_list_populate = ({ list, }) => {

      setStoreAssoc(key, list)

      onLoad({
        list,
      });
  }

  socket.on('users_list_populate', users_list_populate);

  return () => {

    socket && socket.off('users_list_populate', users_list_populate);

    users_delete && socket.off('users_delete', users_delete);

    setStoreAssocDelete(key);
  }
};

export const actionUsersEditFormPopulate = ({
  key,
  id,
  onLoad = () => {},
  users_set_password = () => {},
}) => {

  setStoreAssocDelete(key);

  socket.emit('users_form_populate', id);

  const users_form_populate = (data) => {

    setStoreAssoc(key, data);

    onLoad(data);
  }

  socket.on('users_form_populate', users_form_populate);

  users_set_password && socket.on('users_set_password', users_set_password);

  return () => {

    if (socket) {

      socket.off('users_form_populate', users_form_populate);

      users_set_password && socket.off('users_set_password', users_set_password);
    }
  }
};

export const actionUsersFormSubmit = ({
  form,
}) => {

  socket.emit('users_form_submit', {
    form,
  });
};


export const actionUsersDelete = id => {

  socket.emit('users_delete', id);
};

export const actionGroupsListPopulate = ({
  onLoad = () => {},
  groups_delete = () => {},
  key,
}) => {

  if ( typeof key !== 'string') {

    throw th(`actionGroupsListPopulate key is not a string`);
  }

  setStoreAssocDelete(key);

  socket.emit('groups_list_populate');

  groups_delete && socket.on('groups_delete', groups_delete);

  const groups_list_populate = ({ list, }) => {

    setStoreAssoc(key, list)

    onLoad({
      list,
    });
  }

  socket.on('groups_list_populate', groups_list_populate);

  return () => {

    socket && socket.off('groups_list_populate', groups_list_populate);

    groups_delete && socket.off('groups_delete', groups_delete);

    setStoreAssocDelete(key);
  }
};

export const actionGroupsEditFormPopulate = ({
  key,
  id,
  onLoad = () => {},
  groups_delete = () => {},
  groups_set_password = () => {},
}) => {

  setStoreAssocDelete(key);

  socket.emit('groups_form_populate', id);

  const groups_form_populate = (data) => {

    setStoreAssoc(key, data);

    onLoad(data);
  }

  socket.on('groups_form_populate', groups_form_populate);

  groups_delete && socket.on('groups_delete', groups_delete);

  groups_set_password && socket.on('groups_set_password', groups_set_password);

  return () => {

    if (socket) {

      socket.off('groups_form_populate', groups_form_populate);

      groups_delete && socket.off('groups_delete', groups_delete);

      groups_set_password && socket.off('groups_set_password', groups_set_password);
    }
  }
};

export const actionGroupsFormSubmit = ({
  form,
}) => {

  socket.emit('groups_form_submit', {
    form,
  });
};


export const actionGroupsDelete = id => {

  socket.emit('groups_delete', id);
};


