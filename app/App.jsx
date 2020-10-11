
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';

import { Route, Switch, Redirect } from 'react-router-dom';

import Projects from './views/Projects/Projects';

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


