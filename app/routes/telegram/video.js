'use strict';

const VideoController = require('../../controllers/telegram/video');

module.exports = function addStartTelegramRoutes(bot) {
  const video = new VideoController();

  bot.router
    .when('/video', video);
};

