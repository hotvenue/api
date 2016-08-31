'use strict';

const path = require('path');
const config = require('config');

const log = require('../libraries/log');
const utils = require('../libraries/utils');

const configS3 = config.get('aws.s3');
const configFiletype = config.get('filetype');

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
        this.extension = process.env.NODE_ENV === 'test' ? ext : configFiletype.extension.video;

        const prefixFile = `${configS3.folder.video.tmp}/${this.id}`;

        Promise.resolve()
          .then(() => this.getDevice())
          .then((device) => device.getLocation())
          .then((location) => utils.uploadFile({
            what: 'video',
            oldPath: file.path,
            newPathLocal: path.join(file.destination, this.id + ext),
            newPathCloud: `${prefixFile}_${location.id}${ext}`,
          }))
          .catch((err) => {
            log.error('Error while uploading the video file');

            throw err;
          });
      },
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
          `${this.id}${configFiletype.extension.preview}`,
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
  });

  return video;
};
