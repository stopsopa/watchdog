
const path                                = require('path');

const puppeteer                           = require('puppeteer');

const isObject                            = require('nlab/isObject');

const th                                  = msg => new Error(`scrapper.js error: ${msg}`);

const now                                 = () => (new Date()).getTime();

const {serializeError, deserializeError}  = require('serialize-error');

const log                                 = require('inspc');

const extractChain = request => request.redirectChain().map(r => r.response()).map(r => ({
  status: r.status(),
  headers: r.headers(),
}));

const urlreg = /^https?:\/\//;

const tool = async (url, opt) => {

  let processingError = null;

  let html = null;

  let links = null;

  let explain = null;

  let json = null;

  let text = null;

  let browser = null;

  let headers = null;

  let status = null;

  let redirectChain = [];

  let isResponseHtml = false;

  let isResponseJson = false;

  let isResponseTextPlain = false;

  const n = now();

  const maxTimeout = 5 * 60 * 1000;

  const minTimeout = 5 * 1000;

  opt = {
    ...tool.defaults,
    ...JSON.parse(JSON.stringify(opt || {})),
  };

  let {
    timeout,
    connect,
    waitUntil,
    blockImages,
    limitRedirections,
  } = opt;

  try {

    if ( typeof url !== 'string' ) {

      throw th(`url is not a string`)
    }

    if ( ! urlreg.test(url) ) {

      throw th(`url (${url}) doesn't match regex ${urlreg}`)
    }

    if ( ! isObject(connect) ) {

      throw th(`connect is not an object`)
    }

    if ( typeof timeout === 'string' ) {

      timeout = parseInt(timeout, 10);
    }

    if ( ! Number.isInteger(timeout) ) {

      throw th(`timeout is not defined`)
    }

    if ( timeout < minTimeout ) {

      throw th(`timeout should not be smaller than ${minTimeout / 1000} seconds, and it is '${timeout / 1000}' seconds`)
    }

    if ( timeout > maxTimeout ) {

      throw th(`timeout should not be bigger than ${maxTimeout / 1000} seconds, and it is '${timeout / 1000}' seconds`)
    }

    if ( typeof limitRedirections === 'string' ) {

      limitRedirections = parseInt(limitRedirections, 10);
    }

    if ( ! Number.isInteger(limitRedirections) ) {

      throw th(`limitRedirections is not defined`)
    }

    if ( limitRedirections < 0) {

      throw th(`limitRedirections should not be smaller than 0 but it is: ${limitRedirections}`);
    }

    waitUntil = (function (valid) {

      let t = waitUntil;

      if (typeof t === 'string') {

        if ( ! t || t === 'false' || t === '0' ) {

          t = false;
        }
        else {

          t = [t];
        }
      }

      if ( Array.isArray(t) ) {

        t.forEach(t => {

          if ( ! valid.includes(t)) {

            throw th(`waitUntil param is (${t}) but allowed values are only ${valid.join(',')}, see more about waitUntil: https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#pagegotourl-options`);
          }
        });
      }

      return t;

    }(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']));

    blockImages = (function () {

      let t = blockImages;

      if (t === true || t === false) {

        return t;
      }

      if (typeof t === 'string') {

        if ( ( t === 'false' || t === '0' ) ) {

          blockImages = false;
        }

        return t;
      }

      throw th(`blockImages should be --blockImages false or --blockImages 0 but it is --blockImages ${JSON.stringify(t)}`);

    }());

    tool.validateParams(Object.keys(opt).filter(k => k !== 'connect'));

    connect.headless = false

    browser = await puppeteer.connect(connect);

    // const browser = await puppeteer.launch({
    //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
    // });

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(timeout);

    const options = {};

    if (waitUntil) {

      options.waitUntil = waitUntil;
    }

    await page.setRequestInterception(true);

    page.on('request', request => {

      // log.dump({
      //   'request.resourceType()': request.resourceType(), // more about resourceType() https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/ResourceType
      //   'request.url()': request.url(),
      //   'request.headers()': request.headers(),
      // })
      //     Object {
      //       <request.resourceType()> [String]: >document< len: 8
      //       <request.url()> [String]: >http://localhost/images.html< len: 28
      //       <request.headers()> Object {
      //         <upgrade-insecure-requests> [String]: >1< len: 1
      //         <user-agent> [String]: >Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/78.0.3882.0 Safari/537.36< len: 111
      //         <sec-fetch-mode> [String]: >navigate< len: 8
      //         <sec-fetch-user> [String]: >?1< len: 2
      //       }
      //     }
      //     Object {
      //       <request.resourceType()> [String]: >script< len: 6
      //       <request.url()> [String]: >http://localhost/images.js< len: 26
      //       <request.headers()> Object {
      //         <sec-fetch-mode> [String]: >no-cors< len: 7
      //         <referer> [String]: >http://localhost/images.html< len: 28
      //         <user-agent> [String]: >Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/78.0.3882.0 Safari/537.36< len: 111
      //       }
      //     }
      //     Object {
      //       <request.resourceType()> [String]: >image< len: 5
      //       <request.url()> [String]: >http://localhost/images/jpg.jpg?get=param< len: 41
      //       <request.headers()> Object {
      //         <sec-fetch-mode> [String]: >no-cors< len: 7
      //         <referer> [String]: >http://localhost/images.html< len: 28
      //         <user-agent> [String]: >Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/78.0.3882.0 Safari/537.36< len: 111
      //       }
      //     }
      //     Object {
      //       <request.resourceType()> [String]: >image< len: 5
      //       <request.url()> [String]: >http://localhost/images/png.png?get=param< len: 41
      //       <request.headers()> Object {
      //         <sec-fetch-mode> [String]: >no-cors< len: 7
      //         <referer> [String]: >http://localhost/images.html< len: 28
      //         <user-agent> [String]: >Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/78.0.3882.0 Safari/537.36< len: 111
      //       }
      //     }
      //     Object {
      //       <request.resourceType()> [String]: >image< len: 5
      //       <request.url()> [String]: >http://localhost/images/gif.gif?get=param< len: 41
      //       <request.headers()> Object {
      //         <sec-fetch-mode> [String]: >no-cors< len: 7
      //         <referer> [String]: >http://localhost/images.html< len: 28
      //         <user-agent> [String]: >Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/78.0.3882.0 Safari/537.36< len: 111
      //       }
      //     }
      //     Object {
      //       <request.resourceType()> [String]: >image< len: 5
      //       <request.url()> [String]: >http://localhost/images/bmp.bmp?get=param< len: 41
      //       <request.headers()> Object {
      //         <sec-fetch-mode> [String]: >no-cors< len: 7
      //         <referer> [String]: >http://localhost/images.html< len: 28
      //         <user-agent> [String]: >Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/78.0.3882.0 Safari/537.36< len: 111
      //       }
      //     }

      if ( limitRedirections > 0 && request.isNavigationRequest() && request.redirectChain().length >= limitRedirections ) {

        redirectChain = extractChain(request);

        processingError = `redirections are limited to ${limitRedirections}, but after ${limitRedirections} redirections server still tries to redirect to '${redirectChain[redirectChain.length - 1].headers.location}'`;

        request.abort();
      }
      else {

        if (blockImages && ['image', 'media'].includes(request.resourceType())) {

          request.abort();
        }
        else {

          request.continue();
        }
      }
    });

    let response = await page.goto(url, options);

    // await page.screenshot({ path: path.resolve(__dirname, '..', 'logs', 'images.png'), fullPage: true });

    headers = response.headers();

    status = response.status();

    redirectChain = extractChain(response.request());

    isResponseHtml = (headers['content-type'] || '').includes('text/html')

    isResponseJson = (headers['content-type'] || '').includes('application/json');

    isResponseTextPlain = (headers['content-type'] || '').includes('text/plain');

    if (isResponseHtml) {

      html = await page.evaluate(() => document.documentElement.outerHTML);

      ({ links, explain } = await page.evaluate(() => {

        return (function () {

          var h, t, links = {};

          var path = location.pathname.split('/');
          path.pop();
          path = path.join('/');

          var noorigin = location.href.substring(location.origin.length)
          var nooriginwithouthash = noorigin;

          if (noorigin.indexOf('#') > -1) {
            nooriginwithouthash = noorigin.split('#');
            nooriginwithouthash = nooriginwithouthash[0];
          }

          var list = Array.prototype.slice.call(document.getElementsByTagName('a')).map(function (a) {
            return {
              h: a.getAttribute('href'),

              t: a.getAttribute('target')
              // returning [target] attribute doesn't make sense when I'm removing duplicated links
              // therefore I've remove target from the rest of the logic
            };
          }).filter(function (h) {

            if (h.h) {

              return !!h.h.replace(/^\s*(\S*(\s+\S+)*)\s*$/, '$1')
            }

            return false;
          });

          const explain = [];

          // return {
          //   links: list,
          //   explain,
          // };

          // http://origin/directory/link
          // /directory/link
          // directory/link
          // not //origin/directory/link
          // not #hash
          for (var i = 0, l = list.length ; i < l ; i += 1 ) {

            ({h, t} = list[i]);

            // console.log(JSON.stringify({
            //   a: location.href,
            //   b: (location.origin + nooriginwithouthash),
            //   c: noorigin,
            //   d: nooriginwithouthash
            // }, null, 4));

            if (h === location.href || h === noorigin) {

              explain.push({
                source: h,
                reason: '(h === location.href || h === noorigin)',
              })

              continue;
            }

            if (h[0] === '?') {

              links[h] = {
                assembled: location.origin + location.pathname + h,
                // target: t,
              };

              explain.push({
                source: h,
                target: location.origin + location.pathname + h,
                reason: '(h[0] === \'?\')',
              })

              continue;
            }

            if (/^file:/.test(h)) {

              explain.push({
                source: h,
                reason: '(/^file:/.test(h))',
              })

              continue;
            }

            if (/^mailto:/.test(h)) {

              explain.push({
                source: h,
                reason: '(/^mailto:/.test(h))',
              })

              continue;
            }

            if (/^javascript:/.test(h)) {

              explain.push({
                source: h,
                reason: '(/^javascript:/.test(h))',
              })

              continue;
            }

            if (h[0] === '#') {

              links[h] = {
                assembled: location.origin + nooriginwithouthash + h,
                // target: t,
              };

              explain.push({
                source: h,
                target: location.origin + nooriginwithouthash + h,
                reason: '(h[0] === \'#\')',
              })

              continue;
            }

            if (h[0] === '/') {

              if (h[1] && h[1] === '/') {

                links[h] = {
                  assembled: location.protocol + h,
                  // target: t,
                };

                explain.push({
                  source: h,
                  target: location.protocol + h,
                  reason: '(h[1] && h[1] === \'/\')',
                })

                continue;
              }

              links[h] = {
                assembled: location.origin + h,
                // target: t,
              };

              explain.push({
                source: h,
                target: location.origin + h,
                reason: '(h[0] === \'/\')',
              })

              continue;
            }

            // if (h.indexOf(location.origin) === 0) {
            //   links.push(h.substring(location.origin.length));
            //   continue;
            // }

            if (!/^https?:\/\//i.test(h) && h[0] !== '/') {

              links[h] = {
                assembled: location.origin + path + '/' + h,
                // target: t,
              };

              explain.push({
                source: h,
                target: location.origin + path + '/' + h,
                reason: '(!/^https?:\\/\\//i.test(h) && h[0] !== \'/\')',
              })

              continue;
            }

            links[h] = {
              assembled: h,
              // target: t,
            };

            explain.push({
              source: h,
              target: h,
              reason: 'last',
            })
          }

          return {
            links: Object.keys(links).map(l => ({
              found: l,
              assembled: links[l].assembled,
            })),
            explain,
          };

        }())
      }));
    }

    if (isResponseJson) {

      try {

        json = await response.json();
      }
      catch (e) {

        processingError = '1) ' + String(e);
      }
    }

    if (isResponseTextPlain) {

      try {

        text = await response.text();
      }
      catch (e) {

        processingError = '2) ' + String(e);
      }
    }
  }
  catch (e) {

    e = serializeError(e);

    // const message = e.message || '';
    //
    // if (message.includes('Navigation timeout of') && message.includes(' ms exceeded')) {

    if ( ! processingError) {

      processingError = '3) ' + e.message;
    }

    // }
    // else {
    //
    //   throw e;
    // }
  }

  return {
    response: {
      status,
      // status_DESCRIPTION: 'status code from last response from server after following redirections',
      headers,
      // headers_DESCRIPTION: 'headers from last response from server after following redirections',
      metadata: {
        isResponseHtml,
        isResponseJson,
        isResponseTextPlain,
        // isResponseHtml_DESCRIPTION: `Flag telling if content-type header of last response from server after following redirections contain string 'text/html'`,
        finalUrlAfterRedirections: (Array.isArray(redirectChain) && redirectChain.length) ? redirectChain[redirectChain.length-1].headers.location : null,
        renderTimeInMilliseconds: now() - n,
      },
      redirectChain,
      // redirectChain_DESCRIPTION: `This list contain response headers and status code for each redirection, it will be empty if server did not redirected anywhere`,
      html,
      json,
      text,
      links,
      // explain,
      processingError,
      inputParams: {
        url,
        timeout,
        waitUntil,
        blockImages,
        limitRedirections,
      }
    },
    browser,
  };
}

tool.defaults = {
  timeout: 30 * 1000,
  waitUntil: 'networkidle0',
  blockImages: true,
  limitRedirections: 8,
};

tool.validateParams = function (list) {

  (function (valid) {

    list.forEach(k => {

      if ( ! valid.includes(k) ) {

        throw th(`option '${k}' is not allowed, allowed are: ${valid.join(', ')}`);
      }
    });

  }(['timeout', 'waitUntil', 'blockImages', 'limitRedirections']));
}

module.exports = tool;