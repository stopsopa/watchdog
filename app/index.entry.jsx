
import React, { useEffect, useState, useRef } from 'react';

import { render } from 'react-dom';

// import "regenerator-runtime/runtime.js";
// instead load <script src="/dist/runtime.js"></script>

// import 'semantic-ui-css/semantic.min.css'
// instead load <link rel="stylesheet" href="/public/semantic-ui-css/semantic.min.css">

import log from 'inspc';

import { StoreProjectsProvider } from './views/Projects/storeProjects';
import { StoreAssocProvider } from './_storage/storeAssoc';
import { StoreSocketProvider } from './_storage/storeSocket';

import { GlobalLoaderProvider } from './components/GlobalLoader/GlobalLoader';

import { NotificationsProvider } from './components/Notifications/Notifications';

import FaviconStatusContextDriven from './components/FaviconStatus/FaviconStatusContextDriven';

import App from './App';

import {
  BrowserRouter as Router,
} from "react-router-dom";

const Main = () => (
  <>
    <GlobalLoaderProvider />
    <NotificationsProvider />
    <Router>
      <StoreSocketProvider>
        <StoreProjectsProvider>
          <StoreAssocProvider>
            <FaviconStatusContextDriven />
            <App />
          </StoreAssocProvider>
        </StoreProjectsProvider>
      </StoreSocketProvider>
    </Router>
  </>
)

render(
  <Main />,
  document.getElementById('app')
);

