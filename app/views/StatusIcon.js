
import React, { useRef, useState, useEffect } from 'react';

import classnames from 'classnames';

import './StatusIcon.scss'

// https://github.com/atomiks/tippyjs-react#default-tippy
import Tippy from '@tippyjs/react';

// import 'tippy.js/dist/tippy.css'; // optional
//  <link rel="stylesheet" href="/public/tippy.js/dist/tippy.css">

import log from 'inspc';

export default ({
  status = 'unknown', // unknown, disabled, ok, error
  ...rest
}) => {

  return (
    <Tippy content={`${status} status`}>
      <div className={classnames('status-icon', `status-${status}`)} {...rest} />
    </Tippy>
  );
}