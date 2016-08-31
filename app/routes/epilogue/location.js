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
          name: 'watermark',
          maxCount: 1,
        }])(req, res, () => {
          const imageFrameFile = req.files.frame[0];
          const imageWatermarkFile = req.files.watermark[0];

          if (!imageFrameFile.mimetype.match(/^image\//)) {
            return context.error(409, 'the frame you are trying to upload isn\'t valid');
          }

          if (imageWatermarkFile.mimetype !==
            `image/${configApp.extension.watermark.replace('.', '')}`) {
            return context.error(409, 'the watermark you are trying to upload isn\'t valid');
          }

          context.attributes = { // eslint-disable-line no-param-reassign
            frame: imageFrameFile,
            watermark: imageWatermarkFile,
          };

          return context.continue();
        });
      },
    },
  },
};
