'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;

class StartController extends TelegramBaseController {
  get routes() {
    return {
      '/start': 'startHandler',
    };
  }

  startHandler($) {
    $.sendMessage(`
Welcome to the HotVenue Bot!
You'll be enabled in few minutes...`);

    console.log($);
    console.log(this);
  }
}

module.exports = StartController;
