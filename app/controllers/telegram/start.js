'use strict';

const config = require('config');
const moment = require('moment');
const Telegram = require('telegram-node-bot');

const models = require('../../models');
const log = require('../../libraries/log');

const configTelegram = config.get('telegram');

const TelegramBaseController = Telegram.TelegramBaseController;

class StartController extends TelegramBaseController {
  get routes() {
    return {
      '/start': 'startHandler',
    };
  }

  startHandler($) {
    $.sendMessage(`
Welcome to the HotVenue Bot!
Please specify an email address for you admin account:`);

    let user;
    $.waitForRequest
      .then(($$) => {
        const email = $$.message.text;

        return models.user
          .findCreateFind({
            where: {
              email,
            },
          })
          .spread((tmpUser) => {
            user = tmpUser;
          });
      })
      .then(() => {
        $.api.sendMessage(configTelegram.adminId, `
--- ADMIN ---
New requester:
First name: ${$.message.from.firstName}
Last name: ${$.message.from.lastName}
Username: ${$.message.from.username}
Email: ${user.email}
Created: ${moment(user.createdAt).format('YYYY-MM-DD')}
Telegram ID: ${user.telegramId}`);

        $.api.sendMessage(configTelegram.adminId, 'Do you want to enable it?', {
          reply_markup: JSON.stringify({
            inline_keyboard: [[{
              text: 'YES',
              callback_data: `enable ${$.message.from.id}`,
            }, {
              text: 'NO',
              callback_data: 'nothing',
            }]],
          }),
        });
        $.waitForCallbackQuery(`enable ${$.message.from.id}`, (data) => {
          user.telegramId = $.message.from.id;

          // eslint-disable-next-line no-param-reassign, no-underscore-dangle
          delete $._waitingCallbackQueries[data.data];

          return user.save()
            .then(() => {
              $.api.sendMessage(configTelegram.adminId, 'Done!');
              $.sendMessage('You are now enabled! Type /help to view available commands');
            });
        });
      })
      .catch((err) => {
        log.telegram.error('Error in the start controller');
        log.telegram.debug(err);
      });
  }
}

module.exports = StartController;
