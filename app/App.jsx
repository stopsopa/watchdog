
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import Projects from './views/Projects/Projects';

import ProjectsEdit from './views/Projects/ProjectsEdit';

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
      {socket ? (
        <Switch>
          <Route
            path="/"
            exact={true}
            component={() => <Projects socket={socket} />}
          />
          <Route
            path="/create"
            exact={true}
            component={() => <ProjectsEdit socket={socket} />}
          />
          <Route
            path="/edit/:id"
            exact={true}
            component={(...props) => <ProjectsEdit socket={socket} {...props} />}
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


