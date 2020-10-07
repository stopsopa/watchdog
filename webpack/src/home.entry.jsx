
import React, { useEffect, useState, useRef } from 'react';

import { render } from 'react-dom';

// import "regenerator-runtime/runtime.js";
// instead load <script src="/dist/runtime.js"></script>

// import 'semantic-ui-css/semantic.min.css'
// instead load <link rel="stylesheet" href="/public/semantic-ui-css/semantic.min.css">

import log from 'inspc';

const now = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ').replace(/[^\d]/g, '-');

const {serializeError, deserializeError} = require('serialize-error');

import Textarea from './Textarea.jsx';

import './ttt.scss'

import { Button } from 'semantic-ui-react'

const Main = () => {

  const [ loading, setLoading ] = useState(false);

  const [ basic, setBasic ] = useState(false);

  useEffect(() => {

    (async function () {

      const response = await fetch('/basic');

      const json = await response.json();

      if (json.Authorization) {

        setBasic(json.Authorization);
      }

    }());
  }, []);

  return (
    <>
      <Button>Click Here</Button>
      <br />
      {basic && <Textarea defaultValue={(`
fetch('/scrapper', {
    method: 'POST',
    credentials: 'omit',
    headers: {
        'Content-type': 'application/json; charset=utf-8',${basic ? (`\n        'Authorization': '${basic}',`) : ('')}                
    },
    body: JSON.stringify()
})  
`)} spellCheck={false} correct={10} />}
    </>
  )
}

render(
  <Main />,
  document.getElementById('app')
);

