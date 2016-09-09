'use strict';

const models = require('../../models');
const log = require('../../libraries/log');

module.exports = {
  checkEnabled(ctx, next) {
    const telegramId = ctx.from.id;

    return Promise.resolve()
      .then(() => models.user.findOne({
        where: {
          telegramId,
        },
      }))
      .then((user) => {
        if (!user) {
          log.telegram.warn(`User ${telegramId} not allowed!`);

          ctx.reply('User not allowed to query the Telegram Bot! Please type /start');
          return true;
        }

        return next();
      });
  },
};
