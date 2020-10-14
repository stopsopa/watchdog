
const React = require('react');

require('./NoInput.scss')

function NoInput({
                   checked,
                   onChange,
                   className,
                   children,
                   before,
                   props1,
                   props2,
                   props3,
                   propslabel,
                   radio,
                 }) {

  const cls = ['noinput-checkbox'];

  if (checked) {

    cls.push('checked');
  }

  if (typeof className === 'string') {

    cls.push(className);
  }

  if (radio) {

    cls.push('radio');
  }

  const hasChildren = (typeof children !== 'undefined');

  const component = (
    <div className={cls.join(' ')} {...props1}>
      <div
        tabIndex="0"
        onClick={hasChildren ? undefined : onChange}
        onKeyDown={onChange}
        {...props2}
      >
        <div {...props3}></div>
      </div>
    </div>
  )

  if (hasChildren) {

    if (before) {

      return <label onClick={onChange} {...propslabel}>{children}{component}</label>
    }

    return <label onClick={onChange} {...propslabel}>{component}{children}</label>
  }

  return component;
}

module.exports = NoInput;
