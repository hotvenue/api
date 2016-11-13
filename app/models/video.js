'use strict';

const path = require('path');
const config = require('config');
const moment = require('moment');

const log = require('../libraries/log');
const utils = require('../libraries/utils');

const configS3 = config.get('aws.s3');
const configApp = config.get('app');

module.exports = function createVideo(sequelize, DataTypes) {
  const video = sequelize.define('video', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.VIRTUAL,
      get() {
        const date = moment(this.createdAt).format('YYYY-MM-DD_HH-mm-ss');

        return `video-${date}${configApp.extension.video}`;
      },
    },

    file: {
      type: DataTypes.VIRTUAL,
      set(file) {
        const models = require('../models'); // eslint-disable-line global-require

        const ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        this.extension = process.env.NODE_ENV === 'test' ? ext : configApp.extension.video;

        const prefixFile = `${configS3.folder.video.tmp}/${this.id}`;

        let hash;

        Promise.resolve()
          .then(() => utils.hashFile(file.path))
          .then((tmpHash) => {
            hash = tmpHash;

            return models.video.update({ hash }, {
              where: {
                id: this.id,
              },
            });
          })
          .then(() => models.video.findAll({
            where: {
              hash,
              id: { $ne: this.id },
            },
          }))
          .then((videos) => {
            if (videos.length > 0) {
              throw new Error('Video already uploaded!');
            }

            return true;
          })
          .then(() => utils.uploadFile({
            what: 'video',
            oldPath: file.path,
            newPathLocal: path.join(file.destination, this.id + ext),
            newPathCloud: `${prefixFile}_${this.locationId}${ext}`,
          }))
          .catch((err) => {
            log.error('Error while uploading the video file');
            log.debug(err);

            throw err;
          });
      },
    },

    hash: {
      type: DataTypes.STRING,
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false,
      set(extension) {
        this.setDataValue('extension', extension.toLowerCase());
      },
    },

    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    home: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    privacy: {
      type: DataTypes.STRING,
      defaultValue: '{"name":true,"publish":true}',
      set(privacy) {
        this.setDataValue('privacy', typeof privacy === 'object' ?
          JSON.stringify(privacy)
          :
          privacy
        );
      },
      get() {
        return JSON.parse(this.getDataValue('privacy'));
      },
    },

    urlOriginal: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          this.urlOriginalRelative,
        ].join('/');
      },
    },

    urlOriginalRelative: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.folder.video.original,
          this.id + this.extension,
        ].join('/');
      },
    },

    urlEditedA: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          this.urlEditedARelative,
        ].join('/');
      },
    },

    urlEditedARelative: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.folder.video.editedA,
          this.id + this.extension,
        ].join('/');
      },
    },

    urlPreview: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          this.urlPreviewRelative,
        ].join('/');
      },
    },

    urlPreviewRelative: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.folder.video.preview,
          `${this.id}${configApp.extension.preview}`,
        ].join('/');
      },
    },
  }, {
    classMethods: {
      associate: (models) => {
        video.belongsTo(models.user);
        video.belongsTo(models.device);
        video.belongsTo(models.location);
      },
    },
  });

  return video;
};
