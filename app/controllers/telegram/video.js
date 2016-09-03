'use strict';

const moment = require('moment');
const Telegram = require('telegram-node-bot');
const pluralize = require('pluralize');

const InputFile = Telegram.InputFile;

const HotVenueTelegramBaseController = require('./_base');

const models = require('../../models');

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

module.exports = VideoController;
