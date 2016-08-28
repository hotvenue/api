'use strict';

const path = require('path');
const config = require('config');

const utils = require('../libraries/utils');

const configS3 = config.get('aws.s3');

module.exports = function createLocation(sequelize, DataTypes) {
  const location = sequelize.define('location', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    frame: {
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

        utils.uploadFile({
          what: 'location frame image',
          when: file.mimetype.match(/^image\//),
          oldPath: file.path,
          newPathLocal: path.join(file.destination, this.getDataValue('id') + ext),
          newPathCloud: this.urlFrameRelative,
        });
      },
    },

    watermark: {
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
        utils.uploadFile({
          what: 'location watermark image',
          when: file.mimetype === 'image/png',
          oldPath: file.path,
          newPathLocal: path.join(file.destination, `${this.getDataValue('id')}.png`),
          newPathCloud: this.urlWatermarkRelative,
        });
      },
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    hashtag: {
      type: DataTypes.STRING,
    },

    geoLatitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: { min: -90, max: 90 },
    },

    geoLongitude: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      validate: { min: -180, max: 180 },
    },

    urlFrame: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          this.urlFrameRelative,
        ].join('/');
      },
    },

    urlFrameRelative: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.folder.location.frame,
          this.getDataValue('id') + this.getDataValue('extension'),
        ].join('/');
      },
    },

    urlWatermark: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          this.urlWatermarkRelative,
        ].join('/');
      },
    },

    urlWatermarkRelative: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.folder.location.watermark,
          `${this.getDataValue('id')}.png`,
        ].join('/');
      },
    },
  }, {
    classMethods: {
      associate: (models) => {
        location.hasMany(models.device);
      },
    },
  });

  return location;
};
