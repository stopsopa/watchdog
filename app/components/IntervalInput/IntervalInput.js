
import React, { useReducer, useEffect } from 'react';

import './IntervalInput.scss'

const reg = /^\d+$/;

const msg = msg => `IntervalInput component error: ${msg}`;

const log = (function () {
  try {
    return console.log;
  }
  catch (e) {
    return () => {}
  }
}());

const ms        = require('nlab/ms');

const generate  = ms.generate;

const raw       = ms.raw;

const shift     = ms.shift;

const shiftKeys = Object.keys(shift);

const shiftTrans = {
  ms: `Milliseconds`,
  s: `Seconds`,
  m: `Minutes`,
  h: `Hours`,
  d: `Days`,
  y: `Years`,
}

export default ({
  value,
  onChange = () => {},
  unit = 'ms', // https://github.com/stopsopa/nlab/blob/master/README.md#ms
  include = 'h',
}) => {

  if ( ! shiftKeys.includes(unit) ) {

    log(msg(`unit is not on the list of available units '${shiftKeys.join(', ')}'`));

    unit = 'ms';
  }

  if ( ! shiftKeys.includes(include) ) {

    log(msg(`include is not on the list of available units '${shiftKeys.join(', ')}'`));

    include = 'h';
  }

  let slice = shiftKeys.slice(shiftKeys.indexOf(unit), shiftKeys.lastIndexOf(include) + 1).reverse()

  if ( ! reg.test(value) ) {

    log(msg(`value don't match /^\\d+$/`));

    value = 0;
  }

  const [ interval, dispatch ] = useReducer(function (state, action) {

    if ( ! reg.test(action.value) ) {

      log(msg(`action.value don't match /^\\d+$/`));

      return state;
    }

    const value = parseInt(action.value, 10);

    if ( value < 0 ) {

      log(msg(`value < 0`));

      return state;
    }

    if ( ! slice.includes(action.type) ) {

      log(msg(`action.type '${action.type}' is not on the list of allowed values ${slice.join(', ')}`));

      return state;
    }

    return {
      ...state,
      [action.type]: value,
    }
  }, raw(value));

  useEffect(() => onChange(generate(interval, unit)), [interval]);

  return (
    <table className="interval-input">
      <tbody>
      <tr>
        {slice.map(u => (
          <td key={u}>{shiftTrans[u]}</td>
        ))}
      </tr>
      <tr>
        {slice.map(u => (
          <td key={u}>
            <input value={interval[u]}
                   className="interval-input"
                   onChange={e => dispatch({type: u, value: e.target.value})}
                   onClick={(event) => event.target.select()}
                   autoComplete="nope"
            />
          </td>
        ))}
      </tr>
      </tbody>
    </table>
  )
}