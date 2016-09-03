'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;

class HelpController extends TelegramBaseController {
  get routes() {
    return {
      '/help': 'helpHandler',
    };
  }

  helpHandler($) {
    $.sendMessage(`
Commands:
- /video - retrieves some video stats

- /locations - retrieves the list of the locations, with some stats
- /location - more in deepth stats of a single location`);
  }
}

module.exports = HelpController;
