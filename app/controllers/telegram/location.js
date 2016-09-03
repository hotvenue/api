'use strict';

const pluralize = require('pluralize');

const cloud = require('../../libraries/cloud');
const models = require('../../models');

module.exports = {
  locationsHandler(bot) {
    return (msg) => {
      const chatId = msg.chat.id;

      models.location
        .findAll()
        .then((locations) => {

        });

      Promise
        .all([
          models.video
            .count({
              where: {
                ready: true,
                createdAt: {
                  $gt: new Date(new Date() - 60 * 60 * 1000),
                },
              },
            }),

          models.video.findOne({
            order: [
              ['createdAt', 'DESC'],
            ],
          }),
        ])
        .then(([videoCount, lastVideo]) => Promise.all([
          videoCount,
          lastVideo,
          cloud.download(lastVideo.urlPreviewRelative),
        ]))
        .then(([videoCount, lastVideo, image]) => {
          bot.sendMessage(chatId, `
In the last hour we recorded ${videoCount} ${pluralize('video', videoCount)}
The last one was this: ${lastVideo.urlEditedA}`);
          bot.sendPhoto(chatId, image);
        });
    };
  },
};
