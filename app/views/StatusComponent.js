
import React, { useRef, useState, useEffect, useContext, useMemo } from 'react';

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

  const [ data, setData ] = useState({});

  const [ left, setLeft ] = useState(false);

  useContext(StoreContextAssoc);

  let {
    state: socket,
  } = useContext(StoreContextSocket);

  if ( ! socket ) {

    socket = {}
  }

  const {
    status = 'unknown', // unknown, disabled, ok, error,
  } = data || {};

  useEffect(() => {

    // if (project == 19) {

      let nextTriggerFromNowMilliseconds;

      let cache;

      const run = () => {

        let d;

        if ( project ) {

          d = getStatusPoject(project)
        }

        if ( probe ) {

          d = getStatusProbe(probe);
        }

        try {

          if (d.state.nextTriggerFromNowMilliseconds !== cache) {

            cache = d.state.nextTriggerFromNowMilliseconds;

            setData(d);
          }

          const {
            nextTriggerFromNowMilliseconds,
          } = howMuchTimeLeftToNextTrigger({
            intervalMilliseconds : d.state.db.interval_ms,
            lastTimeLoggedInEsUnixtimestampMilliseconds: d.state.lastTimeLoggedInEsUnixtimestampMilliseconds,
          });

          if (nextTriggerFromNowMilliseconds <= 0) {

            setLeft(false);
          }
          else {

            setLeft(nextTriggerFromNowMilliseconds)
          }
        }
        catch (e) {

          // log.dump({
          //   StatusComponent_calc_error: e
          // })
        }
      }

      let handler = setInterval(run, 1000);

      run();

      return () => {

        clearInterval(handler);

        setLeft(false);

        setData({});
      };
    // }
  }, [socket.id]);

  return (
    <div className={classnames('status-component', className)} {...rest}>
      <StatusIcon status={status} />
      {left && <span className="countdown">{ms(parseInt(left / 1000, 10), 's')}</span>}
    </div>
  );
}