'use strict';

const config = require('config');

const configS3 = config.get('aws.s3');

module.exports = function createLocation(sequelize, DataTypes) {
  const location = sequelize.define('location', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: -90, max: 90 },
    },

    geoLongitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: -180, max: 180 },
    },

    urlFrame: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          configS3.folder.location.frame,
          `${this.getDataValue('id')}.${this.getDataValue('extension')}`,
        ].join('/');
      },
    },
  }, {
    classMethods: {
      associate: (models) => {
        location.hasMany(models.video);
      },
    },
  });

  return location;
};
