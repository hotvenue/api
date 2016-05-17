'use strict';

module.exports = function createLocation(sequelize, DataTypes) {
  const location = sequelize.define('location', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
  }, {
    classMethods: {
      associate: (models) => {
        location.hasMany(models.video);
      },
    },
  });

  return location;
};
