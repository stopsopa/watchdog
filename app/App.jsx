
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import {
  Route,
  Switch,
  Link,
  NavLink,
  Redirect,
} from 'react-router-dom';

import ProjectsList from './views/Projects/ProjectsList';

import ProjectsEdit from './views/Projects/ProjectsEdit';

import Project from './views/Projects/Project';

import ProbeEdit from './views/Probes/ProbeEdit';

import ProbeLog from './views/Probes/ProbeLog';

import LoggersList from './views/Logger/LoggersList';

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
        <div>
          <img src="/watchdog.svg" width="40" height="40" />
          <span className="name">WATCHDOG</span>
        </div>
        <div>
          <NavLink
            to="/projects"
            activeClassName="active"
          >
            Projects
          </NavLink>
          <NavLink
            to="/loggers"
            activeClassName="active"
          >
            Loggers
          </NavLink>
        </div>
      </div>
      <hr />
      {socket ? (
        <Switch>
          <Route
            path="/"
            exact={true}
            component={() => <Redirect to="/projects" />}
          />
          <Route
            path="/projects"
            exact={true}
            component={ProjectsList}
          />
          <Route
            path="/projects/:id(\d+)"
            exact={true}
            component={Project}
          />
          <Route
            path="/projects/create"
            exact={true}
            component={ProjectsEdit}
          />
          <Route
            path="/projects/edit/:id"
            exact={true}
            component={ProjectsEdit}
          />
          <Route
            path="/projects/:project_id(\d+)/probe/create/:type(active|passive)"
            exact={true}
            component={ProbeEdit}
          />
          <Route
            path="/projects/:project_id(\d+)/probe/edit/:probe_id"
            exact={true}
            component={ProbeEdit}
          />
          <Route
            path="/projects/:project_id(\d+)/log/:probe_id"
            exact={true}
            component={ProbeLog}
          />


          <Route
            path="/loggers"
            exact={true}
            component={LoggersList}
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


