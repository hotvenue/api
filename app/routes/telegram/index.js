'use strict';

const fs = require('fs');
const config = require('config');
const TelegramBot = require('node-telegram-bot-api');

const tgConfig = config.get('telegram');
const bot = new TelegramBot(tgConfig.id, tgConfig.options);

module.exports = function addTelegramRoutes() {
  fs
    .readdirSync(__dirname)
    .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
    .forEach((filename) => {
      require(`./${filename}`)(bot); // eslint-disable-line global-require
    });
};
