'use strict';

const fs = require('fs');
const config = require('config');
const Telegram = require('telegram-node-bot');

const log = require('../../libraries/log');

const tgConfig = config.get('telegram');

class HotVenueTelegramLogger {
  constructor(logger) {
    this.log = logger;
  }

  doLog(severity, data) {
    try {
      this.log[severity](JSON.stringify(data));
    } catch (e) {
      console.log(data);
    }
  }

  log(data) {
    this.doLog('info', data);
  }

  warn(data) {
    this.doLog('warn', data);
  }

  error(data) {
    this.doLog('error', data);
  }
}

module.exports = function addTelegramRoutes() {
  const bot = new Telegram.Telegram(tgConfig.id, new HotVenueTelegramLogger(log));

  fs
  .readdirSync(__dirname)
  .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
  .forEach((filename) => {
    require(`./${filename}`)(bot); // eslint-disable-line global-require
  });
};
