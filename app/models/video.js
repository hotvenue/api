'use strict';

const path = require('path');
const config = require('config');

const log = require('../libraries/log');
const utils = require('../libraries/utils');

const configS3 = config.get('aws.s3');

module.exports = function createVideo(sequelize, DataTypes) {
  const video = sequelize.define('video', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    file: {
      type: DataTypes.VIRTUAL,
      /**
       * @param {Object} file
       * @param {string} file.fieldname - The name of the param passed in the POST
       * @param {string} file.originalname
       * @param {string} file.encoding
       * @param {string} file.mimetype
       * @param {string} file.destination - The destination directory path
       * @param {string} file.filename
       * @param {string} file.path - The destination file path
       * @param {string} file.size - Filesize in bytes
       */
      set(file) {
        const ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        this.setDataValue('extension', ext);

        const prefixFile = `${configS3.folder.video.tmp}/${this.getDataValue('id')}`;

        Promise.resolve()
          .then(() => this.getDevice())
          .then((device) => device.getLocation())
          .then((location) => utils.uploadFile({
            what: 'video',
            when: file.mimetype.match(/^video\//),
            oldPath: file.path,
            newPathLocal: path.join(file.destination, this.getDataValue('id') + ext),
            newPathCloud: `${prefixFile}_${location.id}${ext}`,
          }))
          .catch((err) => {
            log.error('Error while uploading the video file');
            log.debug(err);
          });
      },
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    ready: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
          this.getDataValue('id') + this.getDataValue('extension'),
        ].join('/');
      },
    },

    urlEditedA: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          configS3.folder.video.editedA,
          this.getDataValue('id') + this.getDataValue('extension'),
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
          `${this.getDataValue('id')}.jpg`,
        ].join('/');
      },
    },
  }, {
    classMethods: {
      associate: (models) => {
        video.belongsTo(models.user);
        video.belongsTo(models.device);
      },
    },

    instanceMethods: {
      getLocation() {
        if (!this.deviceId) {
          return false;
        }

        return sequelize.models.device.findById(this.deviceId, {
          include: [{ model: sequelize.models.location }],
        })
          .then((device) => device.location);
      },
    },
  });

  return video;
};
