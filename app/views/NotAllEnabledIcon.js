
import React from 'react';

import './NotAllEnabledIcon.scss'

import classnames from 'classnames';

// https://github.com/atomiks/tippyjs-react#default-tippy
import Tippy from '@tippyjs/react';

export default (props = {}) => {

  const {
    className,
    content = '',
    ...rest
  } = props;

  // https://icons8.github.io/flat-color-icons/
  return (
    <div
      className={classnames("notallenabled-icon", className)}
      {...rest}
    >
      <Tippy content={content}>
        <svg
          version="1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="#666"
            strokeWidth="2"
            d="M10,21 C7.50000053,23.5 5.00000002,23 3,21 C0.999999977,19 0.500000114,16.5 3.00000004,14 C5.49999997,11.5 5.99999998,11 5.99999998,11 L13.0000005,18 C13.0000005,18 12.4999995,18.5 10,21 Z M14.0003207,3 C16.5,0.499999776 19,0.999999776 21.001068,3 C23.002136,5.00000022 23.5,7.49999978 21.001068,10 C18.5021359,12.5000002 18.0007478,13 18.0007478,13 L11,6 C11,6 11.5006414,5.50000022 14.0003207,3 Z M11,9.9999 L8.5,12.4999999 L11,9.9999 Z M14,13 L11.5,15.5 L14,13 Z" />
        </svg>
      </Tippy>
    </div>
  )
}