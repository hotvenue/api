'use strict';

const config = require('config');
const multer = require('multer');

const configFolder = config.get('folder');
const configApp = config.get('app');

const upload = multer({ dest: configFolder.upload });

module.exports = {
  create: {
    write: {
      before(req, res, context) {
        upload.fields([{
          name: 'frame',
          maxCount: 1,
        }, {
          name: 'frameThanks',
          maxCount: 1,
        }, {
          name: 'watermark',
          maxCount: 1,
        }])(req, res, () => {
          if (!req.files.frame || !req.files.frameThanks || !req.files.watermark) {
            return context.error(409, 'you must upload also the images');
          }

          const imageFrameFile = req.files.frame[0];
          const imageFrameThanksFile = req.files.frameThanks[0];
          const imageWatermarkFile = req.files.watermark[0];

          if (!imageFrameFile.mimetype.match(configApp.location.frame.isValid)) {
            return context.error(409, 'the frame you are trying to upload isn\'t valid');
          }

          if (!imageFrameThanksFile.mimetype.match(configApp.location.frame.isValid)) {
            return context.error(409, 'the frameThanks you are trying to upload isn\'t valid');
          }

          if (!imageWatermarkFile.mimetype.match(configApp.location.watermark.isValid)) {
            return context.error(409, 'the watermark you are trying to upload isn\'t valid');
          }

          context.attributes = { // eslint-disable-line no-param-reassign
            frame: imageFrameFile,
            frameThanks: imageFrameThanksFile,
            watermark: imageWatermarkFile,
          };

          return context.continue();
        });
      },
    },
  },
};
