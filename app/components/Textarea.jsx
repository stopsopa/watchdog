
import React, { useRef, useState, useEffect } from 'react';

// https://stackoverflow.com/a/5346855
var observe;
if (window.attachEvent) {
  observe = function (element, event, handler) {
    element.attachEvent('on'+event, handler);
  };
}
else {
  observe = function (element, event, handler) {
    element.addEventListener(event, handler, false);
  };
}
function init (text, correct) {
  function resize () {
    // text.style.height = 'auto';
    var h = text.scrollHeight;
    if (Number.isInteger(correct)) {
      h += correct;
    }
    text.style.height = h+'px';
  }
  /* 0-timeout to get the already changed text */
  function delayedResize () {
    window.setTimeout(resize, 0);
  }
  observe(text, 'change',  resize);
  observe(text, 'cut',     delayedResize);
  observe(text, 'paste',   delayedResize);
  observe(text, 'drop',    delayedResize);
  observe(text, 'keydown', delayedResize);

  // text.focus();
  // text.select();
  resize();

  return function () {resize()}
}

export default props => {

  const el = useRef(null);

  const [ resize, setResize ] = useState(false);

  const [ mounted, setMounted ] = useState(false);

  const {
    value,
  } = props;

  const {
    correct,
    ...rest
  } = props

  useEffect(() => {

    if ( ! mounted && el.current ) {

      setMounted(true);

      setResize(init(el.current, correct));
    }

    (typeof resize === 'function') && resize();
  }, [value]);

  return (
    <textarea ref={el} {...rest} />
  )
}