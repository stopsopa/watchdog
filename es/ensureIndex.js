
const estool = require('./es');

const mappings = require('./mapping');

const log = require('inspc');

const putMapping = async (index, mapping) => {

    const es = estool();

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

            const index = (Object.keys(row))[0];

            const response = await es(`/${index}`, {
                method: "DELETE",
            });

            log.dump({
                path: `/${index}`,
                method: "DELETE",
                response,
            }, 6)
        }

    } catch (e) {

        log.dump({
            ensureindex_error: e
        }, 3);

        process.exit(1);
    }
}

module.exports = tool;