
const log           = require('inspc');

const fetch         = require('./jsonfetch');

const isObject         = require('nlab/isObject');

const se         = require('nlab/se');

const dotenv        = require('./dotenv');

const emsg          = msg => `telegram.js: ${msg}`;

const th            = msg => new Error(emsg(msg));

let config = false;

const check = () => {

  if ( ! isObject(config) ) {

    throw th(`first use .config() method to configure library`);
  }

  if ( typeof config.token !== 'string' ) {

    throw th(`config.token !== string`);
  }
}

const tool = async (method, body) => {

  check();

  try {

    if (typeof method !== 'string') {

      throw th(`'method' parameter is not string`);
    }

    if ( ! method ) {

      throw th(`'method' parameter is empty`);
    }

    // log(`https://api.telegram.org/bot${config.token}/${method}`);

    const res = await fetch(`https://api.telegram.org/bot${config.token}/${method}`, {
        body
    });

    if (res.status !== 200) {

      res.body.requestMethod = method;
      res.body.requestBody   = body;

      /**
       * extra handler for known markdown parsing error
Object {
  <error> Object {
    <status> [Integer]: >400<
    <headers> Object {
      <server> [String]: >nginx/1.16.1< len: 12
      <date> [String]: >Sat, 28 Nov 2020 23:56:37 GMT< len: 29
      <content-type> [String]: >application/json< len: 16
      <content-length> [String]: >137< len: 3
      <connection> [String]: >close< len: 5
      <strict-transport-security> [String]: >max-age=31536000; includeSubDomains; preload< len: 44
      <access-control-allow-origin> [String]: >*< len: 1
      <access-control-expose-headers> [String]: >Content-Length,Content-Type,Date,Server,Connection< len: 50
    }
    <body> Object {
      <ok> [Boolean]: >false<
      <error_code> [Integer]: >400<
      <description> [String]: >Bad Request: can't parse entities: Can't find end of the entity starting at byte offset 173< len: 91
    }
  }
}
       */

      const parseEntitiesError = (function () {

        try {

          let match = res.body.description.match(/^.*at byte offset (\d+)$/);

          if ( Array.isArray(match) && match.length === 2) {

            match = parseInt(match[1], 10);

            if (match > 0) {

              res.body.parseEntitiesErrorSubstring = body.text.substring(0, match);
            }
          }

        }
        catch (e) {}
      }());

      return Promise.reject(res);
    }

    return res;
  }
  catch (e) {

    log.dump({
      general_telegram_error: se(e),
    })
  }
}

/**
 * https://core.telegram.org/bots/api#sendmessage
 * https://core.telegram.org/bots/api#markdown-style
 FORMATTING:
 https://i.imgur.com/Uqc5ukf.png
 https://core.telegram.org/bots/api#formatting-options


await telegram.sendMessage({
  chat_id: xxxxxx,
  // text: '123... 456 ... _bold text_',
  text: `_time:_ heroku schedule test...`,
  parse_mode: 'markdown',
  disable_web_page_preview: false,
  disable_notification: false,
})


 */
tool.sendMessage = (opt = {}) => {

  const {
    chat_id,
    ...rest
  } = opt || {};

  if ( ! (typeof chat_id === 'string' || typeof chat_id === 'number') ) {

    throw th("telegram->sendMessage: wrong parameter chat_id - should be like @username || integer");
  }

  return tool('sendMessage', {
    chat_id,
    ...rest
  });
};

/**
 * https://core.telegram.org/bots/api#sendmessage
 */
tool.setWebhook = url => {

  if (typeof url !== 'string') {

    throw th(`tool.setWebhook error: url !== 'string'`);
  }

  return tool('setWebhook', {
    url,
  });
};

tool.resetWebhook = () => {

  if (typeof process.env.HOST === 'string' && ! /^(0\.0\.0\.0|localhost)$/.test(process.env.HOST) ) {

    let url = `${dotenv('PROTOCOL')}://${dotenv('HOST')}`;

    let port = dotenv('PORT');

    port = parseInt(port, 10);

    if (port) {

      const reg = /^\d+$/;

      if ( ! reg.test(port) ) {

        throw new Error(`process.env.PORT don't match ${reg}`);
      }

      if (dotenv('PROTOCOL') === 'https:' && port != 443) {

        url += `:${port}`;
      }

      if (dotenv('PROTOCOL') === 'http:' && port != 80) {

        url += `:${port}`;
      }
    }

    url += `/telegram-webhook`;

    (async function () {

      try {

        await tool.setWebhook(url);

        console.log(`telegram.setWebhook(${url}) - all good`);
      }
      catch (e) {

        log.dump({
          request: `telegram.setWebhook(${url})`,
          setWebhook_error: e
        })
      }
    }())
  }
  else {

    console.log(`telegram.setWebhook(undefined)`)
  }
}

tool.middleware = (data = {}) => {

  log.dump({
    mid: data,
  }, 5)


  /**
   Object {
  <received> [Boolean]: >true<
  <telegram_forward_webhook_traffic> Object {
    <url> [String]: >/telegram-webhook< len: 17
    <method> [String]: >POST< len: 4
    <body> Object {
      <update_id> [Integer]: >171818009<
      <message> Object {
        <message_id> [Integer]: >8<
        <from> Object {
          <id> [Integer]: >593xxx414<
          <is_bot> [Boolean]: >false<
          <first_name> [String]: >simon< len: 5
          <last_name> [String]: >d< len: 1
          <username> [String]: >sxxxopa< len: 8
          <language_code> [String]: >en< len: 2
        }
        <chat> Object {
          <id> [Integer]: >593xxx414<
          <first_name> [String]: >simon< len: 5
          <last_name> [String]: >d< len: 1
          <username> [String]: >stopsopa< len: 8
          <type> [String]: >private< len: 7
        }
        <date> [Integer]: >xxx<
        <text> [String]: >r< len: 1
      }
    }
    <query> Object {
    }
    <headers> Object {
      <host> [String]: >watchdog.xxx.com< len: 24
      <x-request-id> [String]: >7d2a0axxxxxxx98e18< len: 32
      <x-real-ip> [String]: >xxx< len: 12
      <x-forwarded-for> [String]: >xxx< len: 12
      <x-forwarded-proto> [String]: >https< len: 5
      <x-forwarded-host> [String]: >watchdog.xxxx.com< len: 24
      <x-forwarded-port> [String]: >443< len: 3
      <x-scheme> [String]: >https< len: 5
      <content-length> [String]: >299< len: 3
      <content-type> [String]: >application/json< len: 16
      <accept-encoding> [String]: >gzip, deflate< len: 13
    }
  }
}
    */

}

tool.extractRequest = req => ({
  url       : req.url,
  method    : req.method,
  body      : req.body,
  query     : req.query,
  headers   : req.headers,
});

tool.config = opt => {

  config = opt;

  tool.resetWebhook();
};

(function () {

  let telegramNodeServerStatus = {};

  tool.setTelegramNodeServerStatus = (key, value) => {

    if (typeof key !== 'string') {

      throw th(`setTelegramNodeServerStatus error: key !== 'string'`);
    }

    if ( ! key.trim() ) {

      throw th(`setTelegramNodeServerStatus error: key is an empty string`);
    }

    telegramNodeServerStatus[key] = value;

    if (config.io) {

      config.io.emit(key, value);
    }
  }

  tool.getTelegramNodeServerStatus = () => telegramNodeServerStatus;
}());

module.exports = tool;