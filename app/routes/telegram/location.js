'use strict';

const LocationController = require('../../controllers/telegram/location');

module.exports = function addStartTelegramRoutes(bot) {
  const location = new LocationController();

  bot.router
    .when(/^\/location$/, location)
    .when(/^\/locations$/, location);
};

