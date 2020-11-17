'use strict';

// from: https://github.com/floatdrop/require-from-string/blob/master/index.js



// var requireFromString = require('./migrations/CI/executor/require-from-string');
//
// const path = require('path');
//
// const file = path.resolve(__dirname, 'b.js');
//
// const createMod = ret => `module.exports = "${ret}"`;
//
// let mod = requireFromString(createMod('test 1x'), file);
//
// console.log(mod)
//
// mod = requireFromString(createMod('test 2x'), file);
//
// console.log(mod)
//
// will print:
// test 1x
// test 2x


var Module = require('module');
var path = require('path');

module.exports = function requireFromString(code, filename, opts) {
  if (typeof filename === 'object') {
    opts = filename;
    filename = undefined;
  }

  opts = opts || {};
  filename = filename || '';

  opts.appendPaths = opts.appendPaths || [];
  opts.prependPaths = opts.prependPaths || [];

  if (typeof code !== 'string') {
    throw new Error('code must be a string, not ' + typeof code);
  }

  var paths = Module._nodeModulePaths(path.dirname(filename));

  var parent = module.parent;
  var m = new Module(filename, parent);
  m.filename = filename;
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
  m._compile(code, filename);

  var exports = m.exports;
  parent && parent.children && parent.children.splice(parent.children.indexOf(m), 1);

  return exports;
};
