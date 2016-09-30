'use strict';

const helpController = require('../../controllers/telegram/help');

module.exports = function addStartTelegramRoutes(bot) {
  bot
    .command('help', helpController.help);
};

