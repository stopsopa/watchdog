
const path = require('path');

const isObject = require('nlab/isObject');

const th = msg => new Error(`${path.basename(__filename)} error: ${msg}`);

module.exports = function () {

  if ( arguments.length > 0 ) {

    throw th(`Don't pass any arguments to constructor`);
  }

  let opt = {};

  const queue = [];

  let slots = {};

  function trigger() {

    if ( queue.length > 0 ) {

      const keys = Object.keys(slots);

      for ( let i = 0, l = keys.length ; i < l ; i += 1 ) {

        const key = keys[i];

        if ( slots[key] === false ) {

          slots[key] = true;

          let unitOfWork = queue.shift();

          let extra_ = {};

          let unitOfWork_ = unitOfWork;

          if (isObject(unitOfWork)) {

            const {
              unitOfWork,
              ...extra
            } = unitOfWork;

            extra_ = extra;

            unitOfWork_ = unitOfWork;
          }

          unitOfWork_(key, function releaseSlot() {

            if ( typeof slots[key] !== 'undefined') {

              slots[key] = false;
            }

            trigger();

          }, extra_);

          return;
        }
      }
    }
  }

  const tool = unitOfWork => {

    if ( typeof opt.numberOfThreads === 'undefined' ) {

      throw th(`opt.numberOfThreads is undefined, first use setup() method`);
    }

    if ( isObject(unitOfWork) ) {

      if ( typeof unitOfWork.unitOfWork !== 'function') {

        throw th(`unitOfWork.unitOfWork is not a function`);
      }
    }
    else {

      if ( typeof unitOfWork !== 'function') {

        throw th(`unitOfWork is not a function`);
      }
    }

    queue.push(unitOfWork);

    trigger();
  }

  tool.setup = options => {

    if ( typeof options.numberOfThreads !== 'undefined' ) {

      if ( ! Number.isInteger(options.numberOfThreads) ) {

        throw th(`options.numberOfThreads is not an integer`);
      }

      if ( options.numberOfThreads < 1) {

        throw th(`options.numberOfThreads < 1`);
      }
    }

    slots = [...Array(options.numberOfThreads).keys()].reduce((a, v) => {

      const key = v + 1;

      a[key] = slots[key] || false;

      return a;
    }, {});

    opt = {
      ...opt,
      ...options,
    }
  }

  tool.getSetup = () => ({
    ...opt
  });

  tool.getQueue = () => queue;

  return tool;
};