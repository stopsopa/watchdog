
import React, { useRef, useState, useEffect, createRef } from 'react';

import classnames from 'classnames';

import './FaviconStatus.scss'

// WARNING: add "link" tag to main html content
// <link rel="shortcut icon" width="32px">

import log from 'inspc';

function trigger(ctx, fav, dom, status, text, show) {

  const v = 0.5;

  const color = (status === 'ok') ? 'green' : 'red';

  // clear
  ctx.beginPath();
  ctx.clearRect(0, 0, 32, 32);
  ctx.stroke();

  if (show) {

    ctx.beginPath();
    ctx.lineWidth = '1';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    var centerMovementRange = 32 - (2 * 9); // minus 2 times radius of the circle
    // log('centerMovementRange', centerMovementRange)

    var startFromLeft = parseInt((32 - centerMovementRange) / 2, 10);
    // log('startFromLeft', startFromLeft)

    // log('center', startFromLeft + parseInt(v * centerMovementRange, 10))

    ctx.arc(startFromLeft + parseInt(v * centerMovementRange, 10), 9, 9, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.beginPath();

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.font='bold 17px Arial';
  ctx.textAlign = "center";
  // ctx.fillText(String(parseInt(v * 200, 10)), 15, 30);
  ctx.fillText(text, 16, 30);

  // Update favicon to PNG image
  fav.href = dom.current.toDataURL('image/png');
}

export default ({
  status = 'error', // ok, error
  text = 'OFF'
}) => {

  if ( status !== 'error' && status !== 'ok') {

    status = 'error'
  }

  const dom = useRef(null);

  const [ state, setState ] = useState({});

  useEffect(() => {

    // console.log('dom', dom, 'current', dom.current);

    if (dom.current) {

      if ( ! state.ctx ) {

        // log('FaviconStatus getContext')

        const fav = document.querySelector('link[rel*="icon"]');

        if ( ! fav ) {

          throw new Error(`FaviconStatus fav not found`);
        }

        setState({
          ...state,
          ctx: dom.current.getContext('2d'),
          fav,
        });

        return;
      }

    }
  }, [dom]);

  useEffect(() => {

    const {
      ctx,
      fav,
    } = state;

    if ( ! ctx || ! fav ) {

      return;
    }

    const wrap = (function () {
      let show = true;
      return function () {
        trigger(ctx, fav, dom, status, text, show);
        show = !show;
      }
    }());

    const handler = setInterval(wrap, 500);

    return () => clearInterval(handler);

  }, [status, text, state]);

  return (
    <canvas ref={dom} width="32" height="32" className="favicon-canvas"></canvas>
  );
}