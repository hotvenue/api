'use strict';

const _ = require('lodash');
const fs = require('fs');
const config = require('config');
const Telegraf = require('telegraf');

const log = require('../../libraries/log');

const tgConfig = config.get('telegram');

function loggingMiddleware(ctx, next) {
  const start = new Date().getTime();

  // console.log(ctx);

  return next()
    .then(() => {
      const ms = new Date().getTime() - start;
      const obj = _.pick(ctx, [
        'updateType',
        'updateSubType',
      ]);

      if (ctx.message) {
        obj.text = ctx.message.text;
      }

      if (ctx.callbackQuery) {
        obj.data = ctx.callbackQuery.data;
      }

      if (ctx.from) {
        obj.from = `${ctx.from.id} (${ctx.from.first_name} ${ctx.from.last_name} - ${
          ctx.from.username})`;
      }

      obj.responseTime = ms;

      log.telegram.silly(obj);
    });
}

function errorMiddleware(err) {
  log.telegram.error(err.message);
  log.telegram.debug(err);
}

module.exports = function addTelegramRoutes() {
  const bot = new Telegraf(tgConfig.id);

  bot.use(loggingMiddleware);
  bot.use(Telegraf.memorySession());
  bot.catch(errorMiddleware);

  fs
  .readdirSync(__dirname)
  .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
  .forEach((filename) => {
    require(`./${filename}`)(bot); // eslint-disable-line global-require
  });

  if (tgConfig.polling) {
    bot.startPolling();
  }
};
