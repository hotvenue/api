'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const multer = require('multer');

const log = require('../../libraries/log');
const cloud = require('../../libraries/cloud');

const configData = config.get('folder');
const upload = multer({ dest: configData.upload });

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

          const ext = imageFrameFile.originalname
            .substr(imageFrameFile.originalname.lastIndexOf('.'));

          if (!imageFrameFile.mimetype.match(/^image\//)) {
            return context.error(409, 'the frame file you are trying to upload is not an image');
          }

          if (imageWatermarkFile.mimetype !== 'image/png') {
            return context.error(409, 'the watermark file you are trying to upload is not a png');
          }

          context.attributes = { // eslint-disable-line no-param-reassign
            extension: ext,
          };

          return context.continue();
        });
      },
    },

    complete(req, res, context) {
      const location = context.instance;

      const imageFrameFile = req.files.frame[0];
      const imageFrameOldPath = imageFrameFile.path;

      const imageWatermarkFile = req.files.watermark[0];
      const imageWatermarkOldPath = imageWatermarkFile.path;

      if (process.env.NODE_ENV === 'test') {
        const imageFrameNewPath =
          path.join(imageFrameFile.destination, location.id + location.extension);
        const imageWatermarkNewPath =
          path.join(imageWatermarkFile.destination, `${location.id}.png`);

        try {
          fs.renameSync(imageFrameOldPath, imageFrameNewPath);
          fs.unlinkSync(imageFrameOldPath);

          fs.renameSync(imageWatermarkOldPath, imageWatermarkNewPath);
          fs.unlinkSync(imageWatermarkOldPath);
        } catch (err) {
          log.debug('Error while renaming / deleting location images');
          log.error(err);

          context.error(500);
        }

        context.continue();
      } else {
        const imageFrameNewPath = location.urlFrameRelative;
        const imageWatermarkNewPath = location.urlWatermarkRelative;

        cloud.upload(imageFrameOldPath, imageFrameNewPath, (errFrame/* , data */) => {
          if (errFrame) {
            log.debug('Error while uploading the frame image');
            log.error(errFrame);

            context.error(501);
          }

          fs.unlinkSync(imageFrameOldPath);

          cloud.upload(imageWatermarkOldPath, imageWatermarkNewPath, (errWatermark/* , data */) => {
            if (errWatermark) {
              log.debug('Error while uploading the watermark image');
              log.error(errWatermark);

              context.error(500);
            }

            fs.unlinkSync(imageWatermarkOldPath);

            return context.continue();
          });
        });
      }
    },
  },
};
