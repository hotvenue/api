'use strict';

const log = require('../../libraries/log');
const startController = require('../../controllers/telegram/start');

module.exports = function addStartTelegramRoutes(bot) {
  bot.getMe().then((me) => {
    log.server.debug(me);
  });

  bot.onText(/^\/start\s?(.*)?$/, startController.startHandler(bot));
};

