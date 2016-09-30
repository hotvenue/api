'use strict';

const Telegraf = require('telegraf');

const models = require('../../models');

module.exports = {
  location(ctx) {
    return models.location
      .findAll()
      .then((locations) => {
        const buttons = locations.map((location) =>
          Telegraf.Markup.callbackButton(location.name, `location ${location.id}`));

        return ctx.reply('Choose a location:', Telegraf.Markup.inlineKeyboard(buttons, {
          columns: 1,
        }).extra());
      });
  },

  actionLocation(ctx) {
    const locationId = ctx.match[1];

    return Promise.resolve()
      .then(() => models.location.findById(locationId, {
        include: [
          { model: models.video },
        ],
      }))
      .then((location) => ctx.reply(`
${location.name}
- hashtag: ${location.hashtag}
- email: ${location.email}
- videos: ${location.videos.length}`));
  },

  locations(ctx) {
    let msg = 'HotVenue locations:';

    models.location
      .findAll({
        include: [
          { model: models.video },
        ],
      })
      .then((locations) => Promise.all(locations.map((location) => {
        const name = location.name;
        const video = location.videos ? ` (${location.videos.length})` : '';

        return `- ${name} ${video}`;
      })))
      .then((locationMsgs) => {
        msg = `${msg}\n${locationMsgs.join('\n')}`;

        ctx.reply(msg);
      });
  },
};
