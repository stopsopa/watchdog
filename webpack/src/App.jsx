
import React, {
  useEffect,
  useState,
  useRef
} from 'react';

import { render } from 'react-dom';

// import "regenerator-runtime/runtime.js";
// instead load <script src="/dist/runtime.js"></script>

// import 'semantic-ui-css/semantic.min.css'
// instead load <link rel="stylesheet" href="/public/semantic-ui-css/semantic.min.css">

import log from 'inspc';

import Textarea from './Textarea.jsx';

import { Button } from 'semantic-ui-react';

import {
  StoreContext as StoreContextProjects,
  fetchDataAction,
} from './_storage/storeProjects';

import * as storeAssoc from './_storage/storeAssoc';

import io from 'socket.io-client';

let i = 0;

export default function App() {

  const [ socket, setSocket ] = useState(false);

  const [ basic, setBasic ] = useState(false);

  const {
    state: stateProjects,
  } = React.useContext(StoreContextProjects);

  const {
    state: stateAssoc,
    setStoreAssocSet,
  } = React.useContext(storeAssoc.StoreContext);

  useEffect(() => {

    (async function () {

      const response = await fetch('/basic');

      const json = await response.json();

      if (json.Authorization) {

        setBasic(json.Authorization);
      }

    }());

    const socket = io();

    setSocket(socket);

    window.socket = socket;

    socket.on('connect', () => {
      log.dump('connected to server')
    });

    socket.on('disconnect', () => {
      log.dump('disconnect from server')
    });

    socket.on('abc', abc => {
      log.dump({
        abc
      })
    })

  }, []);

  useEffect(() => {
    stateProjects.projects.length === 0 && fetchDataAction();
  }, []);

  return (
    <>
      <Button onClick={() => setStoreAssocSet(`key${i}`, `val${i++}`)}>Click Here</Button>
      <br />
      {basic && <Textarea
        defaultValue={(`
fetch('/scrapper', {
    method: 'POST',
    credentials: 'omit',
    headers: {
        'Content-type': 'application/json; charset=utf-8',${basic ? (`\n        'Authorization': '${basic}',`) : ('')}                
    },
    body: JSON.stringify()
})  
`)}
        spellCheck={false}
        correct={10}
      />}

      <pre>{JSON.stringify(stateProjects, null, 4)}</pre>
      <pre>{JSON.stringify(stateAssoc, null, 4)}</pre>
    </>
  );
}


