'use strict';

const HelpController = require('../../controllers/telegram/help');

module.exports = function addStartTelegramRoutes(bot) {
  const help = new HelpController();

  bot.router
    .when('/help', help)
    .otherwise(help);
};

