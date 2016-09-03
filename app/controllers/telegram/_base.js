'use strict';

const Telegram = require('telegram-node-bot');
const TelegramBaseController = Telegram.TelegramBaseController;

const models = require('../../models');

class HotVenueTelegramBaseController extends TelegramBaseController {
  methodForCommand(command) {
    const method = super.methodForCommand(command);

    return function methodForCommand($) {
      models.user
        .findOne({
          where: {
            telegramId: $.message.from.id,
          },
        })
        .then((user) => {
          if (!user) {
            throw new Error('User not allowed');
          }

          method($);
        })
        .catch(() => {
          $.sendMessage('User not allowed to query the telegram bot! Please type /start');
        });
    };
  }
}

module.exports = HotVenueTelegramBaseController;
