'use strict';

const videoController = require('../../controllers/telegram/video');

module.exports = function addStartTelegramRoutes(bot) {
  bot
    .command('video', videoController.video);
};

