'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const multer = require('multer');

const log = require('../../libraries/log');
const cloud = require('../../libraries/cloud');

const configData = config.get('folder');
const configS3 = config.get('aws.s3');
const upload = multer({ dest: configData.upload });

module.exports = {
  create: {
    write: {
      before(req, res, context) {
        upload.single('image')(req, res, () => {
          const imageFile = req.file;
          const ext = imageFile.originalname.substr(imageFile.originalname.lastIndexOf('.'));

          if (!imageFile.mimetype.match(/^image\//)) {
            return context.error(409, 'the file you are trying to upload is not an image');
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
      const imageFile = req.file;
      const oldImagePath = imageFile.path;

      if (process.env.NODE_ENV === 'test') {
        const newImagePath = path.join(imageFile.destination, location.id + location.extension);

        fs.rename(oldImagePath,
          newImagePath, (err) => {
            if (err) {
              log.debug('Error while renaming the video');
              log.error(err);
            }

            fs.unlinkSync(oldImagePath);

            return context.continue();
          });
      } else {
        const newImagePath =
          `${configS3.folder.location.frame}/${location.id}${location.extension}`;

        cloud.upload(oldImagePath, newImagePath, (err/* , data */) => {
          if (err) {
            log.debug('Error while uploading the image');
            log.error(err);
          }

          fs.unlinkSync(oldImagePath);

          return context.continue();
        });
      }
    },
  },
};
