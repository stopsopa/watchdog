
require('./roderic/restrict-to-node')(__filename);

const path              = require("path");

const webpack           = path.resolve(__dirname);

const root              = path.resolve(webpack, '..');

const vardir            = path.resolve(root, 'var');

// relative path to public server directory
const output            = path.resolve(root, 'public', 'dist');

const node_modules      = path.resolve(root, 'node_modules');

const app               = path.resolve(webpack, 'src');

const override          = path.resolve(webpack, 'override');

require('dotenv-up')({
  override    : false,
  deep        : 3,
}, false, 'config.js');

const env               = require('./roderic/dotenv');

module.exports = mode => ({
  // just name for this project, it's gonna show up in some places
  name: env('DOCKER_IMAGE_NAME_PROD'),
  root,
  app,
  webpack,
  node_modules,
  vardir,
  output,
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
});

