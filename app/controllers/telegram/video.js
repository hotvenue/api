'use strict';

const moment = require('moment');
const pluralize = require('pluralize');

const models = require('../../models');

/*

class VideoController extends HotVenueTelegramBaseController {
  get routes() {
    return {
      '/video': 'videoHandler',
    };
  }

  videoHandler($) {
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
      .then(([videoCount, lastVideo]) => {
        $.sendMessage(`
In the last hour we recorded ${videoCount} ${pluralize('video', videoCount)}
The last one was this: ${lastVideo.urlEditedA}`);

        const date = moment(lastVideo.createdAt).format('YYYY-MM-DD_HH-mm-ss');
        $.sendPhoto(InputFile.byUrl(lastVideo.urlPreview, `video-${date}.jpg`));
      });
  }
}

*/

module.exports = {
  video(ctx) {
    return Promise.all([
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
      .then(([videoCount, lastVideo]) => {
        const date = moment(lastVideo.createdAt).format('YYYY-MM-DD_HH-mm-ss');

        return Promise.resolve()
          .then(() => ctx.reply(`
In the last hour we recorded ${videoCount} ${pluralize('video', videoCount)}
The last one was this: ${lastVideo.urlEditedA}`))
          .then(() => ctx.replyWithPhoto({
            url: lastVideo.urlPreview,
            filename: `video-${date}.jpg`,
          }));
      });
  },
};
