
module.exports = (function (obj, tmp) {

  process.argv
    .slice(2)
    .map(a => {

      if (a.indexOf('--') === 0) {

        tmp = a.substring(2).replace(/^\s*(\S*(\s+\S+)*)\s*$/, '$1');

        if (tmp) {

          obj[tmp] = (typeof obj[tmp] === 'undefined') ? true : obj[tmp];
        }

        return;
      }

      if (a === 'true') {

        a = true
      }

      if (a === 'false') {

        a = false
      }

      if (tmp !== null) {

        if (obj[tmp] === true) {

          return obj[tmp] = [a];
        }

        try {

          obj[tmp].push(a);
        }
        catch (e) {

        }
      }
    })
  ;

  Object.keys(obj).map(k => {
    (obj[k] !== true && obj[k].length === 1) && (obj[k] = obj[k][0]);
    (obj[k] === 'false') && (obj[k] = false);
  });

  return {
    all: () => JSON.parse(JSON.stringify(obj)),
    get: (key, def) => {

      var t = JSON.parse(JSON.stringify(obj));

      if (typeof def === 'undefined')

        return t[key];

      return (typeof t[key] === 'undefined') ? def : t[key] ;
    },
    update: data => {

      // delete data['config'];
      //
      // delete data['dump'];
      //
      // delete data['help'];
      //
      // delete data['inject'];

      obj = data;
    }
  };
}({}));