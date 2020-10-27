
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import ProjectsList from './views/Projects/ProjectsList';

import ProjectsEdit from './views/Projects/ProjectsEdit';

import Project from './views/Projects/Project';

import ProbeEdit from './views/Probes/ProbeEdit';

import ProbeLog from './views/Probes/ProbeLog';

import './App.scss'

import {
  Button,
  Breadcrumb,
} from 'semantic-ui-react';

import * as storeSocket from './_storage/storeSocket';

export default function App() {

  const {
    state: socket,
  } = useContext(storeSocket.StoreContext);

  return (
    <>
      <div className="brand">
        <img src="/watchdog.svg" width="40" />
        <span>WATCHDOG</span>
      </div>
      <hr />
      {socket ? (
        <Switch>
          <Route
            path="/"
            exact={true}
            component={ProjectsList}
          />
          <Route
            path="/:id(\d+)"
            exact={true}
            component={Project}
          />
          <Route
            path="/create"
            exact={true}
            component={ProjectsEdit}
          />
          <Route
            path="/edit/:id"
            exact={true}
            component={ProjectsEdit}
          />
          <Route
            path="/:project_id(\d+)/probe/create/:type(active|passive)"
            exact={true}
            component={ProbeEdit}
          />
          <Route
            path="/:project_id(\d+)/probe/edit/:probe_id"
            exact={true}
            component={ProbeEdit}
          />
          <Route
            path="/:project_id(\d+)/log/:probe_id"
            exact={true}
            component={ProbeLog}
          />
          <Route
            exact={true}
            component={() => `Unhandled url...`}
          />

        </Switch>
      ) : (
        <div>Connecting ...</div>
      )}
    </>
  );
}


