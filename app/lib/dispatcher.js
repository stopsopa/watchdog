
function dispatcher() {
  this.list = [];

}
dispatcher.prototype.addEventListener = function (fn) {
  this.removeEventListener(fn);
  this.list.push(fn);
  return this;
}
dispatcher.prototype.removeEventListener = function (fn) {
  this.list = this.list.filter(f => f !== fn);
  return this;
}
dispatcher.prototype.dispatchEvent = function (...args) {
  this.list.forEach(fn => fn(...args));
  return this;
}
dispatcher.prototype.promisify = function (executeBeforeReturn) {

  const promise = new Promise((resolve, reject) => {

    const listener = (data = {}) => {

      this.removeEventListener(listener);

      resolve(data);
    }

    this.addEventListener(listener);
  });

  if (typeof executeBeforeReturn === 'function') {

    executeBeforeReturn();
  }

  return promise;
}

module.exports = () => (new dispatcher());