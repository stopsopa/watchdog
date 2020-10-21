
const se = require('nlab/se');

module.exports = async function (req) {

  try {

    return {
      probe: true,
    }
  }
  catch (e) {

    // remember also to properly handle any potential errors

    return {
      probe: false, // still "probe" key with boolean value type is required
      catch: se(e),
    }
  }
}