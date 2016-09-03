'use strict';

const fs = require('fs');
const config = require('config');
const Telegram = require('telegram-node-bot');

const log = require('../../libraries/log');

const tgConfig = config.get('telegram');
const bot = new Telegram.Telegram(tgConfig.id, log.telegram);

module.exports = function addTelegramRoutes() {
  fs
    .readdirSync(__dirname)
    .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
    .forEach((filename) => {
      require(`./${filename}`)(bot); // eslint-disable-line global-require
    });
};
