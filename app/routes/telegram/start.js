'use strict';

const log = require('../../libraries/log');
const StartController = require('../../controllers/telegram/start');

module.exports = function addStartTelegramRoutes(bot) {
  bot.api.getMe().then((me) => {
    log.server.debug(me);
  });

  bot.router
    .when('/start', new StartController());
};

