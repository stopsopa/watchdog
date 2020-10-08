
import React, { useEffect, useState, useRef } from 'react';

import { render } from 'react-dom';

// import "regenerator-runtime/runtime.js";
// instead load <script src="/dist/runtime.js"></script>

// import 'semantic-ui-css/semantic.min.css'
// instead load <link rel="stylesheet" href="/public/semantic-ui-css/semantic.min.css">

import log from 'inspc';

import { StoreProjectsProvider } from './_storage/storeProjects';
import { StoreAssocProvider } from './_storage/storeAssoc';

import App from './App';

const Main = () => (
  <StoreAssocProvider>
    <StoreProjectsProvider>
      <App />
    </StoreProjectsProvider>
  </StoreAssocProvider>
)

render(
  <Main />,
  document.getElementById('app')
);

