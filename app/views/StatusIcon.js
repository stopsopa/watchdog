
import React, { useRef, useState, useEffect } from 'react';

import classnames from 'classnames';

import './StatusIcon.scss'

import log from 'inspc';

export default ({
  status = 'disabled', // error, ok
  ...rest
}) => {

  return (
    <div className={classnames('status-icon', `status-${status}`)} {...rest} />
  );
}