
const path = require('path');

const c = require('nlab/colors');

const request = require('./request');

const {serializeError, deserializeError} = require('serialize-error');

const log = require('inspc');

require('dotenv-up')({
  override    : true,
  deep        : 2,
}, false, 'docker.js');

const th = msg => new Error(`${path.basename(__filename)} error: ${msg}`);

const root = path.resolve(__dirname, '..');

const cmd = require('./cmd');

module.exports = {
  cmd,
  removecontainer: async ignoreerrorcode => {

    let data;

    try {

      data = await cmd(['docker', 'container', 'rm', process.env.DOCKER_TEST_CONTAINER_NAME, '-f']);
    }
    catch (e) {

      const code = e.code;

      if ( code === 0 || ( typeof ignoreerrorcode === 'undefined' || code === ignoreerrorcode )  ) {

        return e;
      }

      throw e;
    }

    return data;
  },
  build: () => cmd([ // docker build -t "$DOCKER_IMAGE_NAME_DEV" .
    'docker',
    'build',
    '-f',
    'Dockerfile.dev',
    '-t',
    process.env.DOCKER_IMAGE_NAME_DEV,
    '.'
  ]),
  server: () => cmd([
    'docker',
    'run',
    '-d',
    '-p', `${process.env.DOCKER_HOST_PUPPETEER}:3000`,
    '-p', `${process.env.DOCKER_HOST_SCRAPPER}:3001`,
    '--name', process.env.DOCKER_TEST_CONTAINER_NAME,
    '-v', `${root}:/var/app/runtime`,
    process.env.DOCKER_IMAGE_NAME_DEV,
    '/bin/bash',
    'server.sh'
  ]),
  request: async (path, opt) => {

    try {

      if ( ! /^https?:\/\//.test(path) ) {

        path = `http://0.0.0.0:${process.env.DOCKER_HOST_SCRAPPER}${path}`;
      }

      console.log(`docker.request(${c.g(path)})`)

      const data = await request(path, opt);

      if (data.status !== 200) {

        throw new Error(`data.status !== 200`);
      }

      return data.body;
    }
    catch (e) {

      throw new Error(`docker.request error: ${JSON.stringify(serializeError(e), null, 4)}`);
    }
  }
}