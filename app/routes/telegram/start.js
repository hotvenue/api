'use strict';

const log = require('../../libraries/log');
const startController = require('../../controllers/telegram/start');

module.exports = function addStartTelegramRoutes(bot) {
  if (process.env.NODE_ENV !== 'test') {
    bot.telegram.getMe().then((me) => {
      log.telegram.debug(me);
    });
  }

  bot
    .command('start', startController.start)
    .hears(/^([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/, startController.hearsEmail)
    .action(/^enable (.*)$/, startController.actionEnable);
};

