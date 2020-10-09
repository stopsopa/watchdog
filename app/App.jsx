
import React, {
  useEffect,
  useState,
  useRef,
  useContext,
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

import * as storeSocket from './_storage/storeSocket';

let i = 0;

export default function App() {

  const [ basic, setBasic ] = useState(false);

  const {
    state: stateProjects,
  } = useContext(StoreContextProjects);

  const {
    state: stateAssoc,
    setStoreAssocSet,
  } = useContext(storeAssoc.StoreContext);

  const {
    state: socket,
  } = useContext(storeSocket.StoreContext);

  useEffect(() => {

    if (socket) {

      const abc = (a, b, c) => {

        log.dump({
          t: 'browser',
          a, b, c
        })
      };

      socket.on('abc', abc)

      return () => { // https://stackoverflow.com/a/34716449/5560682
        socket.off('abc', abc)
      }
    }

  }, [socket]);

  useEffect(() => {

    (async function () {

      const response = await fetch('/basic');

      const json = await response.json();

      if (json.Authorization) {

        setBasic(json.Authorization);
      }

    }());

  }, []);

  useEffect(() => {
    stateProjects.projects.length === 0 && fetchDataAction();
  }, []);

  return (
    <>
      {socket && (
        <>
          <Button onClick={() => socket.emit('as:abc', 'arg1', 'arg2', ['arg3'])}>socket</Button>
          <br />
        </>
      )}
      <Button onClick={() => setStoreAssocSet(`key${i}`, `val${i++}`)}>setStoreAssocSet</Button>
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


