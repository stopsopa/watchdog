
import React, { useRef, useState, useEffect, useContext } from 'react';

import classnames from 'classnames';

import './StatusComponent.scss'

// https://github.com/atomiks/tippyjs-react#default-tippy
import Tippy from '@tippyjs/react';

// import 'tippy.js/dist/tippy.css'; // optional
//  <link rel="stylesheet" href="/public/tippy.js/dist/tippy.css">

import log from 'inspc';

const ms        = require('nlab/ms');

const generate  = ms.generate;

const raw       = ms.raw;

import StatusIcon from './StatusIcon'

import howMuchTimeLeftToNextTrigger from '../howMuchTimeLeftToNextTrigger';

import {
  StoreContext as StoreContextAssoc,
  getStatusProbe,
  getStatusPoject,
} from '../_storage/storeAssoc'


import {
  StoreContext as StoreContextSocket,
} from '../_storage/storeSocket';

export default ({
  project,
  probe,
  className,
  ...rest
}) => {

  useContext(StoreContextAssoc);

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  if ( ! socket ) {

    socket = {}
  }

  const [ data, setData ] = useState({});

  const {
    status = 'unknown', // unknown, disabled, ok, error,
    state,
  } = data || {};

  const [ left, setLeft ] = useState(false);

  let nextTriggerFromNowMilliseconds;

  try {

    nextTriggerFromNowMilliseconds = state.nextTriggerFromNowMilliseconds;
  }
  catch (e) {}

  const refresh = () => {

    if ( project ) {

      setData(getStatusPoject(project));

      return true;
    }

    if ( probe ) {

      setData(getStatusProbe(probe));

      return true;
    }

    return false;
  }

  useEffect(() => {

    if ( ! nextTriggerFromNowMilliseconds ) {

      if (refresh()) {

        return;
      }
    }

    if (nextTriggerFromNowMilliseconds > 0) {

      let handler;

      const clear = () => {

        clearInterval(handler);

        setLeft(false);
      }

      function run() {

        try {

          const {
            nextTriggerFromNowMilliseconds,
          } = howMuchTimeLeftToNextTrigger({
            intervalMilliseconds : state.db.interval_ms,
            lastTimeLoggedInEsUnixtimestampMilliseconds: state.lastTimeLoggedInEsUnixtimestampMilliseconds,
          });

          if (nextTriggerFromNowMilliseconds <= 0) {

            // log.dump({
            //   clear: howMuchTimeLeftToNextTrigger({
            //     intervalMilliseconds : state.db.interval_ms,
            //     lastTimeLoggedInEsUnixtimestampMilliseconds: state.lastTimeLoggedInEsUnixtimestampMilliseconds,
            //   })
            // });

            // clear()
          }
          else {

            setLeft(nextTriggerFromNowMilliseconds)
          }
        }
        catch (e) {

          log.dump({
            errr: e
          })
        }

        refresh();
      }

      handler = setInterval(run, 1000);

      run();

      return clear;
    }
  }, [nextTriggerFromNowMilliseconds, socket.id]);

  return (
    <div className={classnames('status-component', className)} {...rest}>
      <StatusIcon status={status} />
      {left && <span className="countdown">{ms(parseInt(left / 1000, 10), 's')}</span>}
    </div>
  );
}