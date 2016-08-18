'use strict';

const videoController = require('../../controllers/telegram/video');

module.exports = function addStartTelegramRoutes(bot) {
  bot.onText(/\/video/, videoController.statsHandler(bot));
};

