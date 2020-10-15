
const se = require('nlab/se');

module.exports = async function (req) {

  try {

    const data = await jsonfetch('http://example.com/');

    delete data.body; // to reduce log size

    return { // this object should have only two keys: 'proble' and 'data' (where data is optional)

      // This is the only field used to determine if probe passed the test,
      // rest of data (from 'optionalLog' field) goes straight to the elasticsearch logs as it is.

      // Try to don't put too much data there - be reasonable

      // Driver responsible for running this code will check if it returns an object
      // and if the object have 'probe' key with boolean type value.
      // Any deviation from those conditions will cause driver to throw "Invalid probe error'.
      probe: data.status === 200,


      optionalLog: data, // optional field
    }
  }
  catch (e) {

    // remember also to properly handle any potential errors

    return {
      probe: false, // still "probe" key with boolean value type is required
      optionalLog: {

        // if it reached catch then try to use always 'catch' key in 'optionalLog' in es
        // to store catch error messages the same way for general consistancy of future queries,
        // to be able filter out all results that falled into catch for example
        catch: se(e), // Casting exception to string (which will happen implicitly) is not extracting all available data from it, use se()

        // you can add something extra keys/data here
      }
    }
  }
}