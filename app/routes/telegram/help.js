'use strict';

const HelpController = require('../../controllers/telegram/help');

module.exports = function addStartTelegramRoutes(bot) {
  bot.router
    .when('/help', new HelpController());
};

