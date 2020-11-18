/**
 *
 * // just string
 * node CI/nitro/convert-migration-in-ts-syntax-to-vanila-node.js src/migration/1602541889003-auto.ts string
 *
 * // create instance
 * node CI/nitro/convert-migration-in-ts-syntax-to-vanila-node.js src/migration/1602541889003-auto.ts
 *
 */
const fs = require('fs');

const path = require('path');

const log = require('inspc');

const isObject = require('nlab/isObject');

const isAsyncFunction = require('nlab/isAsyncFunction');

var requireFromString = require('./require-from-string');

const th = msg => new Error(`convert-migration-in-ts-syntax-to-vanila-node.js error: ${msg}`);

const tool = opt => {

  const {
    migrationFile,
    debug = false,
    replace = c => {

      // remove
      //     import {MigrationInterface, QueryRunner} from "typeorm";
      c = c.replace(/import\s+{\s*MigrationInterface\s*,\s*QueryRunner\s*}\s*from\s+"typeorm"\s*;?/ig, '');


      // if found:

//`export class auto1602281400784 implements MigrationInterface {
//    name = 'auto1602281400784'`
      if (/export\s+class\s+[a-z_\d]+\s+implements\s+MigrationInterface\s+{(\s+name)\s*=(\s*'[a-z\d]+')/ig.test(c)) {

        // replace

//`export class auto1602281400784 implements MigrationInterface {
//    name = 'auto1602281400784'`
        // to

//`module.exports = {
//    name: 'auto1602281400784'`
        c = c.replace(/export\s+class\s+[a-z\d]+\s+implements\s+MigrationInterface\s+{(\s+name)\s*=(\s*'[a-z\d]+')/ig, 'module.exports = {$1:$2');

        // public async up(queryRunner: QueryRunner): Promise<void> {
        // public async down(queryRunner: QueryRunner): Promise<void> {
        // to
        // up: async function (queryRunner) {
        // down: async function (queryRunner) {
        c = c.replace(/\s*public\s+async\s+(up|down)\(queryRunner:\s*QueryRunner\):\s*Promise<[a-z]+>\s*{/ig, ',\n$1: async function (queryRunner) {');

      }
      else {

        // replace

//`export class auto1602281400784 implements MigrationInterface {
        // to

//`module.exports = {
//    name: 'auto'`
        c = c.replace(/export\s+class\s+[a-z_\d]+\s+implements\s+MigrationInterface\s+{(\s+)/ig, `module.exports = {$1name: 'auto'$1`);

        // public async up(queryRunner: QueryRunner): Promise<void> {
        // public async down(queryRunner: QueryRunner): Promise<void> {
        // to
        // up: async function (queryRunner) {
        // down: async function (queryRunner) {
        c = c.replace(/\s*public\s+async\s+(up|down)\(queryRunner:\s*QueryRunner\):\s*Promise<[a-z]+>\s*{/ig, ',\n$1: async function (queryRunner) {');

      }

      return c;
    },
  } = opt || {};

  if ( ! fs.existsSync(migrationFile) ) {

    throw th(`file '${migrationFile}' doesn't exist`);
  }

  const content = fs.readFileSync(migrationFile, 'utf8').toString();

  const code = replace(content);

  if (debug) {

    return log.dump({
      "convert-migration-in-ts-syntax-to-vanila-node": {
        before: content,
        after: code,
      }
    })
  }

  return code;
}

module.exports = tool;

// https://nodejs.org/docs/latest/api/all.html#modules_accessing_the_main_module
if (require.main === module) {

  if ( typeof process.argv[2] !== 'string' ) {

    throw th(`process.argv[2] is not specified`);
  }

  if ( ! process.argv[2].trim() ) {

    throw th(`process.argv[2] is an empty string after trim`);
  }

  if (process.argv[3]) {

    tool({
      migrationFile: process.argv[2],
      debug: true,
    });
  }
  else {

    const code = tool({
      migrationFile: process.argv[2],
    });

    const module = requireFromString(code, path.resolve(process.cwd(), process.argv[2]));

    log.dump({
      module,
    })

    if ( ! isObject(module) ) {

      throw th(`module is not an object`);
    }

    console.log('assert: module is an object');

    if ( typeof module.name !== 'string' ) {

      throw th(`module.name is not a string`);
    }

    console.log('assert: module.name is a string');

    if ( ! isAsyncFunction(module.up) ) {

      throw th(`module.up is not an async function`);
    }

    console.log('assert: module.up is an async function');

    if ( ! isAsyncFunction(module.down) ) {

      throw th(`module.down is not an async function`);
    }

    console.log('assert: module.down is an async function');

    console.log("");

    console.log("all good");
  }
}


