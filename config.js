
require('./lib/restrict-to-node')(__filename);

const path              = require("path");

const root              = path.resolve(__dirname);

const vardir            = path.resolve(root, 'var');

const _public            = path.resolve(root, 'public');

// relative path to public server directory
const output            = path.resolve(_public, 'dist');

const node_modules      = path.resolve(root, 'node_modules');

const app               = path.resolve(root, 'app');

const override          = path.resolve(app, 'override');

require('dotenv-up')({
  override    : false,
  deep        : 3,
}, false, 'config.js');

const env               = require('./app/lib/dotenv');

module.exports = mode => ({
  // just name for this project, it's gonna show up in some places
  name: env('PROJECT_NAME'),
  root,
  app,
  node_modules,
  vardir,
  output,
  // public: _public,
  resolve: [ // where to search by require and files to watch

    app,

    override,

    'node_modules', // https://github.com/ReactTraining/react-router/issues/6201#issuecomment-403291934
  ],
  js: {
    entries: [ // looks for *.entry.{js|jsx} - watch only on files *.entry.{js|jsx}
      app,
      // ...
    ],
  },
  server: {
    preprocessor  : path.resolve(_public, "preprocessed.js"),
    buildtime     : path.resolve(_public, 'buildtime.js'),
  },
});

