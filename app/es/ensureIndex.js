
const estool = require('./es');

const mappings = require('./mapping');

const log = require('inspc');

const color = require('../lib/color');

const putMapping = async (index, mapping) => {

    const es = estool();

    index = es.prefix(index);

    const r = await es(`/${index}`, {
        method: 'PUT',
        body: mapping,
    });

    if ( r.error ) {

        if ( r.error.type == 'resource_already_exists_exception' ) {

            console.log(`Creating: Index '${index}' already exists`);
            
            // log.dump({
            //     esIndexInfo: `Index '${index}' already exists`
            // }, 3);

            return true;
        }

        const err = {
            esIndexError: r
        };

        if ( typeof r.error === 'string' && r.error.includes('Incorrect HTTP method for uri')) {

            err.error_reference = 'https://github.com/elastic/elasticsearch-php/issues/731#issuecomment-367004295'
        }

        log.dump(err, 3);

        return false;
    }

    log.dump(`Creating es index '${index}'`);

    console.log(r)

    try {

        if ( (r.status === 200 && r.body.acknowledged === true) || r.body.error.type === 'resource_already_exists_exception') {

            // all good

            return true;
        }
    }
    catch (e) {

        log.dump({
            putMapping_error: 'condition (r.status === 200 && r.body.acknowledged === true) || r.body.error.type === \'resource_already_exists_exception\'   failed'
        })
    }

    return true;
}

const tool = async () => {
   
    try {

        if ( ! mappings.length ) {

            return null;
        }

        for (let row of mappings) {

            const index = (Object.keys(row))[0];

            const mapping = row[index];

            try {

                await putMapping(index, mapping)
            }
            catch (e) {

                log.dump({
                    eeeee: e
                })
            }

        }

    } catch (e) {

        log.dump({
            ensureindex_error: e
        }, 3);
        
        process.exit(1);
    }
}

tool.delete = async (index) => {

    // curl -XDELETE -H "Authorization: Basic xxx"  http://elastic.xxx.com/watchdog

    try {

        if (typeof index !== 'string') {

            console.log(color(`\n\n    specify index name with --delete argument\n\n`, 'r'))

            process.exit(1);
        }

        if ( ! index.trim() ) {

            console.log(color(`\n\n    value of --delete argument is an empty string\n\n`, 'r'))

            process.exit(1);
        }

        console.log(color(`deleting index\n`), 'g')

        const es = estool();

        if ( ! mappings.length ) {

            return null;
        }

        for (let row of mappings) {

            let idx = (Object.keys(row))[0];

            if (idx !== index) {

                console.log(color(`skipping index ${idx}`, 'y'))

                continue;
            }

            console.log(color(`deleting index ${idx}`, 'r'))

            idx = es.prefix(idx);

            const response = await es(`/${idx}`, {
                method: "DELETE",
            });

            log.dump({
                path: `/${idx}`,
                method: "DELETE",
                response,
            }, 6)
        }

        console.log("\n\n    all good\n\n")

    } catch (e) {

        log.dump({
            delete_es_index_error: e
        }, 3);
    }

    process.exit(0);
}

module.exports = tool;