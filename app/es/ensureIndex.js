
const estool = require('./es');

const mappings = require('./mapping');

const log = require('inspc');

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

tool.delete = async () => {

    // curl -XDELETE -H "Authorization: Basic xxx"  http://elastic.xxx.com/pendulum

    try {

        console.log(`deleting index\n`)

        const es = estool();

        if ( ! mappings.length ) {

            return null;
        }

        for (let row of mappings) {

            let index = (Object.keys(row))[0];

            index = es.prefix(index);

            const response = await es(`/${index}`, {
                method: "DELETE",
            });

            log.dump({
                path: `/${index}`,
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