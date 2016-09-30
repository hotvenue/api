'use strict';

const baseController = require('../../controllers/telegram/_base');
const deviceController = require('../../controllers/telegram/device');

module.exports = function addStartTelegramRoutes(bot) {
  bot
    .command('devices', baseController.checkEnabled, deviceController.devices)
    .command('device', baseController.checkEnabled, deviceController.device)
    .action(/^device ([^\s]+)$/, baseController.checkEnabled, deviceController.actionDevice)
    .action(/^device loc ([^\s]+)$/,
      baseController.checkEnabled,
      deviceController.actionDeviceLocation)
    .action(/^device loc set ([^\s]+)$/,
      baseController.checkEnabled,
      deviceController.actionDeviceLocationSet);
};

