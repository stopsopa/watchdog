/**
 * Usage

 const log = require('inspc');

 const {
  compare,
  generate,
} = require('./app/lib/password');

 const password = 'abc';

 const hash = generate(password);

 log.dump({
  password,
  hash,
  valid: compare(password, hash)
})

 */

let crypto = require('crypto');

const isObject = require('nlab/isObject');

const generateSalt = require('nlab/generateSalt');

const th = msg => new Error(`${__filename} password.js error: ${msg}`);

const hasher = (password, salt) => {

  if ( typeof password !== 'string' ) {

    throw th(`password !== 'string'`);
  }

  if ( ! password.trim() ) {

    throw th(`! password.trim()`);
  }

  if ( typeof salt !== 'string' ) {

    throw th(`salt !== 'string'`);
  }

  if ( ! salt.trim() ) {

    throw th(`! salt.trim()`);
  }

  let hash = crypto.createHmac('sha512', salt);

  hash.update(password);

  hash = hash.digest('hex');

  return {
    salt,
    hash,
  };
};
const generate = (password, characters = 128) => {

  return hasher(password, generateSalt(characters));
}

const compare = (password, hash) => {

  if ( typeof password !== 'string' ) {

    throw th(`password !== 'string'`);
  }

  if ( ! password.trim() ) {

    throw th(`! password.trim()`);
  }

  if ( ! isObject(hash) ) {

    throw th(`! isObject(hash)`);
  }

  if ( typeof hash.salt !== 'string' ) {

    throw th(`hash.salt !== 'string'`);
  }

  if ( ! hash.salt.trim() ) {

    throw th(`! hash.salt.trim()`);
  }

  if ( typeof hash.hash !== 'string' ) {

    throw th(`hash.hash !== 'string'`);
  }

  if ( ! hash.hash.trim() ) {

    throw th(`! hash.hash.trim()`);
  }

  return hasher(password, hash.salt).hash === hash.hash;
};

module.exports = {
  compare,
  generate,
  hasher,
}