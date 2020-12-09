
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

import UsersList from './views/Users/UsersList';

import UsersEdit from './views/Users/UsersEdit';

import GroupsList from './views/Groups/GroupsList';

import GroupsEdit from './views/Groups/GroupsEdit';

import Messengers from './views/Messengers/Messengers'

import MessengersEdit from './views/Messengers/MessengersEdit'

import Telegram from './views/Messengers/Telegram/Telegram'

import RecoilToDoExample from './recoil/RecoilToDoExample'

import RecoilAsync from './recoil/RecoilAsync'

import DataFlowGraph from './recoil/DataFlowGraph'

import DataFlowGraphParamFromUrl from './recoil/DataFlowGraphParamFromUrl'

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
            to="/users"
            activeClassName="active"
          >
            Users
          </NavLink>
          <NavLink
            to="/groups"
            activeClassName="active"
          >
            Groups
          </NavLink>
          <NavLink
            to="/messengers"
            activeClassName="active"
          >
            Messengers
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
            path="/users"
            exact={true}
            component={UsersList}
          />
          <Route
            path="/users/create"
            exact={true}
            component={UsersEdit}
          />
          <Route
            path="/users/:id"
            exact={true}
            component={UsersEdit}
          />


          <Route
            path="/groups"
            exact={true}
            component={GroupsList}
          />
          <Route
            path="/groups/create"
            exact={true}
            component={GroupsEdit}
          />
          <Route
            path="/groups/:id"
            exact={true}
            component={GroupsEdit}
          />

          <Route
            path="/messengers"
            exact={true}
            component={Messengers}
          />
          <Route
            path="/messengers/create"
            exact={true}
            component={MessengersEdit}
          />
          <Route
            path="/messengers/edit/:id"
            exact={true}
            component={MessengersEdit}
          />

          <Route
            path="/messengers/telegram"
            exact={true}
            component={Telegram}
          />



          <Route
            path="/DataFlowGraph"
            exact={true}
            component={DataFlowGraph}
          />
          <Route
            path="/DataFlowGraph/:id"
            exact={true}
            component={DataFlowGraphParamFromUrl}
          />
          <Route
            path="/RecoilToDoExample"
            exact={true}
            component={RecoilToDoExample}
          />
          <Route
            path="/RecoilAsync"
            exact={true}
            component={RecoilAsync}
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


