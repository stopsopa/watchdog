
import React, { useRef, useState, useEffect } from 'react';

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

export default ({
  status = 'unknown', // unknown, disabled, ok, error
  state,
  className,
  ...rest
}) => {

  const [ left, setLeft ] = useState(false);

  let nextTriggerFromNowMilliseconds;

  try {

    nextTriggerFromNowMilliseconds = state.nextTriggerFromNowMilliseconds;
  }
  catch (e) {}

  useEffect(() => {

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

            clear()
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
      }

      handler = setInterval(run, 1000);

      run();

      return clear;
    }
  }, [nextTriggerFromNowMilliseconds]);

  return (
    <div className={classnames('status-component', className)} {...rest}>
      <StatusIcon status={status} />
      {left && <span className="countdown">{ms(parseInt(left / 1000, 10), 's')}</span>}
    </div>
  );
}