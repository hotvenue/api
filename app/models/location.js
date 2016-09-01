'use strict';

const path = require('path');
const config = require('config');

const utils = require('../libraries/utils');

const configS3 = config.get('aws.s3');
const configApp = config.get('app');

module.exports = function createLocation(sequelize, DataTypes) {
  const location = sequelize.define('location', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    frame: {
      type: DataTypes.VIRTUAL,
      set(file) {
        const ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        const filename = this.id + ext;

        this.setDataValue('frame', filename);

        utils.uploadFile({
          what: 'location frame image',
          oldPath: file.path,
          newPathLocal: path.join(file.destination, filename),
          newPathCloud: `${configS3.folder.location.tmpFrame}/${filename}`,
        });
      },
    },

    frameThanks: {
      type: DataTypes.VIRTUAL,
      set(file) {
        const ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        const filename = `${this.id}-thanks${ext}`;

        this.setDataValue('frameThanks', filename);

        utils.uploadFile({
          what: 'location frameThanks image',
          oldPath: file.path,
          newPathLocal: path.join(file.destination, filename),
          newPathCloud: `${configS3.folder.location.tmpFrame}/${filename}`,
        });
      },
    },

    watermark: {
      type: DataTypes.VIRTUAL,
      set(file) {
        utils.uploadFile({
          what: 'location watermark image',
          oldPath: file.path,
          newPathLocal: path.join(file.destination,
            `${this.id}${configApp.extension.watermark}`),
          newPathCloud:
            `${configS3.folder.location.tmpWatermark}/${this.id}${configApp.extension.watermark}`,
        });
      },
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    hashtag: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true,
      },
      set(email) {
        this.setDataValue('email', email.toLowerCase());
      },
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
          this.id + this.extension,
        ].join('/');
      },
    },

    urlFrameThanks: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          this.urlFrameThanksRelative,
        ].join('/');
      },
    },

    urlFrameThanksRelative: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.folder.location.frame,
          `${this.id}-thanks${configApp.extension.frame}`,
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
          this.id + configApp.extension.watermark,
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
