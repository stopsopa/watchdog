
import React, { useReducer, useEffect } from 'react';

import './IntervalInput.scss'

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

const reg = /^\d+$/;

export default ({
  value,
  onChange = () => {},
  valueunit = 'ms', // https://github.com/stopsopa/nlab/blob/master/README.md#ms
  rangestart = 's',
  rangeend = 'h',
}) => {

  if ( ! shiftKeys.includes(valueunit) ) {

    log(msg(`valueunit is not on the list of available units '${shiftKeys.join(', ')}'`));

    valueunit = 'ms';
  }

  if ( ! shiftKeys.includes(rangestart) ) {

    log(msg(`rangestart is not on the list of available units '${shiftKeys.join(', ')}'`));

    rangestart = 'ms';
  }

  if ( ! shiftKeys.includes(rangeend) ) {

    log(msg(`rangeend is not on the list of available units '${shiftKeys.join(', ')}'`));

    rangeend = 'h';
  }

  let slice = shiftKeys.slice(shiftKeys.indexOf(rangestart), shiftKeys.lastIndexOf(rangeend) + 1).reverse()

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

    // log({
    //   reducer: {
    //     ...state,
    //     [action.type]: value,
    //   },
    //   valueunit,
    // })

    return {
      ...state,
      [action.type]: value,
    }
  }, raw(value, valueunit));

  // log({
  //   value,
  //   valueunit,
  //   init: raw(value, valueunit),
  // })

  useEffect(() => onChange(generate(interval, valueunit)), [interval]);

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