
const fs = require('fs');

module.exports = (file, refreshEverySec, postProccess) => {

    refreshEverySec = parseInt(refreshEverySec || 0, 10);

    if (refreshEverySec < 5) {

        throw new Error(`refreshEverySec can't be smaller then 5 (sec)`);
    }

    (typeof postProccess === 'function') || (postProccess = content => content);

    let cache = false;

    return () => {

        const now = parseInt((new Date()).getTime() / 1000, 10);

        if ( ! cache || ( (now - cache.time) > refreshEverySec) ) {

            try {

                fs.accessSync(file, fs.constants.R_OK);
            }
            catch (e) {

                throw new Error(`file '${file}' is not readdable`);
            }

            cache = {
                time: now,
                content: postProccess(fs.readFileSync(file).toString(), file)
            }
        }

        return cache.content;
    };
};