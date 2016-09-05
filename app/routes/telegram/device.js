'use strict';

const DeviceController = require('../../controllers/telegram/device');

module.exports = function addStartTelegramRoutes(bot) {
  const device = new DeviceController();

  bot.router
    .when(/^\/devices$/, device)
    .when(/^\/device$/, device);
};

