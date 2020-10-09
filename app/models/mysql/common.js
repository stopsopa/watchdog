
const abstract          = require('knex-abstract');

const extend            = abstract.extend;

const prototype         = abstract.prototype;

const trim              = require('nlab/trim');

// const a             = prototype.a;

module.exports = knex => extend(knex, prototype, {
    /**
     * There is also command triggering this logic:
     * /bin/bash console.sh dbnodetimediff
     */
    howMuchDbIsFasterThanNode: async function (crushnodeifdiffgreaterthansec = false) {

        const mysql = parseInt(await this.queryColumn(`select UNIX_TIMESTAMP() c`), 10);

        const node  = parseInt((new Date()).getTime() / 1000, 10);

        if ( ! Number.isInteger(this._dbtimeoffset) ) {

            this._dbtimeoffset = mysql - node;
        }

        if (crushnodeifdiffgreaterthansec === true) {

            if ( ! /^\d+$/.test(process.env.PROTECTED_MYSQL_MAX_TIME_DIFF || '') ) {

                console.log(`process.env.PROTECTED_MYSQL_MAX_TIME_DIFF (value: '${process.env.PROTECTED_MYSQL_MAX_TIME_DIFF}') is not defined or it doesn't match /^\\d+$/`);

                process.exit(1);
            }

            crushnodeifdiffgreaterthansec = parseInt(process.env.PROTECTED_MYSQL_MAX_TIME_DIFF, 10);
        }

        if ( Number.isInteger(crushnodeifdiffgreaterthansec) ) {

            const abs = Math.abs(this._dbtimeoffset);

            if (abs > crushnodeifdiffgreaterthansec) {

                throw new Error(`
mysql.common.howMuchDbIsFasterThanNode() error: mysql - node UTC time differance '${abs}' is greater than '${crushnodeifdiffgreaterthansec}' sec
if thats linux machine consider running on it: 
    sudo date +"%Y-%m-%d %H:%M:%S" -s "$(curl -s "http://worldtimeapi.org/api/timezone/Europe/London.txt" | grep -v _datetime | grep datetime | awk '{print $2}' | sed -r 's#^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2}).*#\\1-\\2-\\3 \\4:\\5:\\6#')"
                `);
            }

            console.log(`Time differance between mysql and node.js clock time is: howMuchDbIsFasterThanNode() -> '${abs}', should be smaller than abs(${this._dbtimeoffset}) <= ${crushnodeifdiffgreaterthansec}`)

            console.log("Time diff is small enough 👍")
        }

        return this._dbtimeoffset;
    }
});