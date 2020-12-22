
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
 https://gist.github.com/stopsopa/f1bf716478283192dcdf6cfa7ffd5bb3
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

  const parse_mode = opt.parse_mode;

  if (parse_mode === 'MarkdownV2' && typeof rest.text === 'string') {

    rest.text = MarkdownV2fix(rest.text)
  }

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

tool.telegram_get_bot_info = async () => {

  try {

    let data = {};

    try {

      // curl https://api.telegram.org/botxxxx:AAHxxxxxxxxxG8/getMe
      const res = await tool('getMe');

      let ok = false;

      try {

        ok = res.body.ok === true && isObject(res.body.result);
      }
      catch (e) {}

      if (ok) {

        data = res.body.result;
      }
      else {

        data.error = res;
      }

    }
    catch (e) {

      data.error = e.message;
    }

    tool.setTelegramNodeServerStatus('getMe', data);
  }
  catch (e) {

    log.dump({
      telegram_get_bot_info__error: se(e)
    })
  }
}

tool.middleware = async (data = {}) => {

  const help = `
[[I'm not programmed to take part in the conversation (yet).]]
The only commands that I understand are:
/myid [[- return details about your account (most importantly user ID)]]
/start [[- help]]
`

  try {

    const text = (data?.body?.message?.text || '').toLowerCase().trim();

    if (typeof text !== 'string') {

      throw new Error(`text is not a string`);
    }

    if ( ! text ) { // this case is rather impossible but still let's handle it explicitly

      return;
    }

    const senderId = data?.body?.message?.from?.id;

    switch (text) {
      case '/myid':
        {

          let username = data?.body?.message?.from?.username ?? '';

          await tool.sendMessage({
            chat_id: senderId,
            text: `
👤 You
 ├ *id*: \`[[${senderId}]]\`
 ├ *[[is_bot]]*: \`[[${String(data?.body?.message?.from?.is_bot ?? '[no is bot flag]')}]]\`
 ├ *[[first_name]]*: \`[[${data?.body?.message?.from?.first_name ?? '[no first name]'}]]\`
 ├ *[[last_name]]*: \`[[${data?.body?.message?.from?.last_name ?? '[no last name]'}]]\` 
 ├ *username*: \`[[${username || '[no username]'}]]\` 
 └ *link*: [[[https://t.me/${username}]]]([[https://t.me/${username}]]) 
          `,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            // disable_notification: false,
          })
        }

        break;
      case '/start':

        {

          let username;

          let text = ''

          try {

            username = tool.getTelegramNodeServerStatus().getMe.username;

            let first_name = tool.getTelegramNodeServerStatus().getMe.first_name;

            text = `
[[🤖 Hi I'm the bot and my name is '${first_name}' and this is my official share link:]]
[[[https://t.me/${username}]]]([[https://t.me/${username}]])
[[Tip: Use right mouse click and "Copy Link" - it might not work when clicked here on the chat.]]

${help}`
          }
          catch (e) {

            text = `[[Error: Can't extract tool.getTelegramNodeServerStatus().getMe.username]]`
          }

          await tool.sendMessage({
            chat_id: senderId,
            text,
            parse_mode: 'MarkdownV2',
            disable_web_page_preview: true,
            // disable_notification: false,
          });

        }

        break;
      default:

        await tool.sendMessage({
          chat_id: senderId,
          text: help,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true,
          // disable_notification: false,
        });

        log.dump({
          telegram_unhandled: data,
        }, 9);

        break;
    }

  }
  catch (e) {

    log.dump({
      "telegram.js general middleware error": se(e),
    })
  }


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

  tool.telegram_get_bot_info();
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

function MarkdownV2fix(text) {
  return text.replace(
    /\[\[([^\[][\s\S]*?)\]\]/g,
    (a, b) => b.replace(/([\.\(\)\*\+-_`>=#|{}!~])/g, '\\$1')
  )
}