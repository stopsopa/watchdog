
import React, { useRef, useState, useEffect, createRef, useContext } from 'react';

// WARNING: add "link" tag to main html content
// <link rel="shortcut icon" width="32px">

import log from 'inspc';

import FaviconStatus from './FaviconStatus';

import {
  StoreContext as StoreContextAssoc,
  getStatusFavicon,
} from '../../_storage/storeAssoc';

export default () => {

  useContext(StoreContextAssoc);

  const data = getStatusFavicon();

  return (
    <FaviconStatus {...data} />
  );
}