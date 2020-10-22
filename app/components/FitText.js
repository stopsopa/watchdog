
import React, { useRef, useState, useEffect } from 'react';

export default ({
  text = '',
  tolerance = 2,
  initFontSize = 13,
  minFontSize = 8,
  ...rest
}) => {

  const el = useRef(null);

  const [ state, setState ] = useState({
    char: String.fromCharCode(160),
    css: {
      fontSize: initFontSize,
    }
  });

  useEffect(() => {

    setState({
      ...state,
      char    : false,
      height  : el.current.offsetHeight,
    })

    // console.log('str.charCodeAt(0)', tmp.charCodeAt(tmp), 'should be 160', 160, '');
    // should be 160 it's no-break space http://www.unicode-symbol.com/u/00A0.html#:~:text=This%20code%20point%20first%20appeared,is%20sometimes%20abbreviated%20as%20NBSP.
  }, []);

  useEffect(() => {

    if (state.height) {

      if ( el.current.offsetHeight > (state.height) ) {

        const s = parseFloat(state.css.fontSize, 10);

        if (s > minFontSize) {

          setState({
            ...state,
            css: {
              fontSize: `${s - 0.5}px`
            },
          })
        }
      }
    }
  });

  return (
    <span
      ref={el}
      style={state.css || undefined}
      {...rest}
    >{state.char || text}</span>
  );
}