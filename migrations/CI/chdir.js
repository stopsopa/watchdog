
const path = require('path');



const serializeError = require('nlab/serializeError');

(function () {

  // in order to prevent error:

  // Object {
  //     <e> Object {
  //         <name> [String]: >SyntaxError< len: 11
  //         <message> [String]: >Cannot use import statement outside a module< len: 44
  //         <stack> [String]: >/Users/sd/Workspace/projects/z_roderic_new/roderic-project/migrations/src/entity/Alert.ts:1
  // import {
  // ^^^^^^

  const dir = path.resolve(__dirname, '..', 'CI');

  // console.log(`entering current working directory: \n${dir}\nfrom:\n${process.cwd()}`);

  try {

    process.chdir(dir);
  }
  catch (e) {

    log.dump({
      'entering current working directory failed: ': serializeError(e),
    })

    throw e;
  }
}());