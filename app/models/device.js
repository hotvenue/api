'use strict';

module.exports = function createLocation(sequelize, DataTypes) {
  const device = sequelize.define('device', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  }, {
    classMethods: {
      associate: (models) => {
        device.belongsTo(models.location);
        device.hasMany(models.video);
      },
    },
  });

  return device;
};
