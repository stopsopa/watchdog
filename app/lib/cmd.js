
const { spawn } = require("child_process");

const se = require('nlab/se');

const th    = msg => new Error(`${__filename} error: ${msg}`);

module.exports = (cmd, opt) => new Promise((resolve, reject) => {

  if (typeof cmd === 'string') {

    cmd = cmd.trim();

    if ( ! cmd ) {

      throw th(`cmd is an empty string`);
    }

    cmd = cmd.split(/\s+/);
  }

  if ( ! Array.isArray(cmd) ) {

    throw th(`cmd is not an array`);
  }

  if ( ! cmd.length) {

    throw th(`cmd is an empty array`);
  }

  const {
    verbose = false,
  } = {...opt};

  verbose && console.log(`executing command ${cmd.join(' ')}`)

  const [command, ...args] = cmd;

  const process = spawn(command, args);

  let stdout = '';

  let stderr = '';

  process.stdout.on("data", data => {
    stdout += String(data);
  });

  process.stderr.on("data", data => {
    stderr += String(data);
  });

  process.on('error', (e) => {

    verbose && console.log(`error: ${e.message}`);

    reject({
      cmd,
      stdout,
      stderr,
      e: se(e)
    });
  });

  process.on("close", code => {

    verbose && console.log(`child process ${cmd.join(' ')} exited with code ${code}`);

    if (code === 0) {

      resolve({
        cmd,
        stdout,
        stderr,
        code,
      });
    }

    reject({
      cmd,
      stdout,
      stderr,
      code,
    });
  });
})
