'use strict';

const config = require('config');
const multer = require('multer');
const ForbiddenError = require('epilogue').Errors.ForbiddenError;

const models = require('../../models');
const log = require('../../libraries/log');

const configData = config.get('folder');
const upload = multer({ dest: configData.upload });

module.exports = {
  create: {
    write: {
      before(req, res, context) {
        upload.single('video')(req, res, () => {
          const videoFile = req.file;

          context.attributes = { // eslint-disable-line no-param-reassign
            file: videoFile,
          };

          if (!req.body.user) {
            return context.error(500, 'no user specified');
          }

          if (!req.body.device) {
            return context.error(500, 'no device specified');
          }

          return models.user
            .findCreateFind({
              where: req.body.user,
            })
            .spread((user/* , created */) => {
              context.attributes.user = { // eslint-disable-line no-param-reassign
                id: user.id,
              };

              delete req.body.user; // eslint-disable-line no-param-reassign

              return models.device
                .findOne({
                  where: req.body.device,
                })
                .then((device) => {
                  context.attributes.deviceId = device.id; // eslint-disable-line no-param-reassign

                  delete req.body.device; // eslint-disable-line no-param-reassign

                  return context.continue();
                })
                .catch((err) => {
                  log.debug('Error while finding the device in a POST /video');
                  log.error(err);

                  return context.error(500, 'something bad happened');
                });
            })
            .catch((err) => {
              log.debug('Error while findOrCreating the new user in a POST /video');
              log.error(err);

              return context.error(500, 'something bad happened');
            });
        });
      },
    },
  },

  update: {
    auth() {
      throw new ForbiddenError();
    },
  },
};
