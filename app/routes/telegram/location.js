'use strict';

const baseController = require('../../controllers/telegram/_base');
const locationController = require('../../controllers/telegram/location');

module.exports = function addStartTelegramRoutes(bot) {
  bot
    .command('locations', baseController.checkEnabled, locationController.locations)
    .command('location', baseController.checkEnabled, locationController.location)
    .action(/^location ([^\s]+)$/, baseController.checkEnabled, locationController.actionLocation);
};

