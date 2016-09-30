'use strict';


const config = require('config');
const moment = require('moment');
const Telegraf = require('telegraf');

const models = require('../../models');
const log = require('../../libraries/log');
const cache = require('../../libraries/cache');

const configTelegram = config.get('telegram');

module.exports = {
  start(ctx) {
    ctx.session.started = true; // eslint-disable-line no-param-reassign

    return ctx.reply(`
Welcome to the HotVenue Bot!
Please specify an email address for you admin account:`);
  },

  hearsEmail(ctx) {
    if (ctx.session.started) {
      ctx.session.started = false; // eslint-disable-line no-param-reassign

      const email = ctx.message.text;
      let user;

      return models.user
        .findCreateFind({
          where: {
            email,
          },
        })
        .spread((tmpUser) => { user = tmpUser; })
        .then(() => ctx.reply('Thanks, you\'ll be enabled in minutes...'))
        .then(() => ctx.telegram.sendMessage(configTelegram.adminId, `
--- ADMIN ---
New requester:
First name: ${ctx.from.first_name}
Last name: ${ctx.from.last_name}
Username: ${ctx.from.username}
Email: ${user.email}
Created: ${moment(user.createdAt).format('YYYY-MM-DD')}
Telegram ID: ${user.telegramId}`))
        .then(() => ctx.telegram.sendMessage(configTelegram.adminId,
          'Do you want to enable it?',
          Telegraf.Markup.inlineKeyboard([
            Telegraf.Markup.callbackButton('YES', `enable ${ctx.from.id}`),
            Telegraf.Markup.callbackButton('NO', 'nothing'),
          ]).extra()
        ))
        .then(() => new Promise((resolve, reject) => {
          cache.set(`telegraf:${ctx.from.id}:enable`, user.id, (err, res) => {
            if (err) {
              reject(err);
              return;
            }

            resolve(res);
          });
        }))
        .catch((err) => {
          log.telegram.error('Error while hearsEmail');
          log.telegram.debug(err);
        });
    }

    return true;
  },

  actionEnable(ctx) {
    const telegramId = ctx.match[1];

    return new Promise((resolve, reject) => {
      cache.get(`telegraf:${telegramId}:enable`, (err, reply) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(reply);
      });
    })
      .then((userId) => models.user.findById(userId))
      .then((user) => {
        user.telegramId = telegramId; // eslint-disable-line no-param-reassign

        return user.save();
      })
      .then(() => ctx.reply('Done!'))
      .then(() => ctx.telegram.sendMessage(telegramId,
        'You are now enabled! Type /help to view available commands'))
      .then(() => new Promise((resolve, reject) => {
        cache.del(`telegraf:${telegramId}:enable`, (err, reply) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(reply);
        });
      }))
      .catch((err) => {
        log.telegram.error('Error while actionEnable');
        log.telegram.debug(err);
      });
  },
};
