'use strict';

const Telegraf = require('telegraf');

const models = require('../../models');
const cache = require('../../libraries/cache');

module.exports = {
  device(ctx) {
    return models.device
      .findAll()
      .then((devices) => {
        const buttons = devices.map((device) =>
          Telegraf.Markup.callbackButton(device.name || device.identifierForVendor,
            `device ${device.id}`));

        return ctx.reply('Choose a device:', Telegraf.Markup.inlineKeyboard(buttons, {
          columns: 1,
        }).extra());
      });
  },

  actionDevice(ctx) {
    const deviceId = ctx.match[1];

    return models.device
      .findById(deviceId, {
        include: [
          { model: models.location },
          { model: models.video },
        ],
      })
      .then((device) => {
        let msg = device.name || device.identifierForVendor;

        if (device.location) {
          msg += `\n- location: ${device.location.name}`;
        }

        if (device.videos) {
          msg += `\n- videos: ${device.videos.length}`;
        }

        ctx.reply(msg, Telegraf.Markup.inlineKeyboard([
          Telegraf.Markup.callbackButton('Update device\'s location', `device loc ${device.id}`),
        ]).extra());
      });
  },

  actionDeviceLocation(ctx) {
    const deviceId = ctx.match[1];

    return new Promise((resolve, reject) => {
      cache.set(`telegraf:${ctx.from.id}:device`, deviceId, (err, res) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(res);
      });
    })
      .then(() => models.location.findAll())
      .then((locations) => {
        const buttons = locations.map((location) =>
          Telegraf.Markup.callbackButton(location.name, `device loc set ${location.id}`));

        return ctx.reply('Choose a location:', Telegraf.Markup.inlineKeyboard(buttons, {
          columns: 1,
        }).extra());
      });
  },

  actionDeviceLocationSet(ctx) {
    const locationId = ctx.match[1];

    return new Promise((resolve, reject) => {
      cache.get(`telegraf:${ctx.from.id}:device`, (err, reply) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(reply);
      });
    })
      .then((deviceId) => models.device.update({ locationId }, {
        where: {
          id: deviceId,
        },
      }))
      .then(() => ctx.reply('Location changed!'))
      .then(() => new Promise((resolve, reject) => {
        cache.del(`telegraf:${ctx.from.id}:device`, (err, reply) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(reply);
        });
      }));
  },

  devices(ctx) {
    let msg = 'HotVenue devices:';

    models.device
      .findAll({
        include: [
          { model: models.video },
          { model: models.location },
        ],
      })
      .then((devices) => Promise.all(devices.map((device) => {
        const name = device.name || device.identifierForVendor;
        const location = device.location ? device.location.name : 'no location';
        const video = device.videos ? ` (${device.videos.length})` : '';

        return `- ${name} @ ${location}${video}`;
      })))
      .then((deviceMsgs) => {
        msg = `${msg}\n${deviceMsgs.join('\n')}`;

        ctx.reply(msg);
      });
  },
};
