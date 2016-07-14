'use strict';

const config = require('config');

const configS3 = config.get('aws.s3');

module.exports = function createLocation(sequelize, DataTypes) {
  const location = sequelize.define('location', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
        location.hasMany(models.video);
        location.hasMany(models.device);
      },
    },
  });

  return location;
};
