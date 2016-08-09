'use strict';

module.exports = function createLocation(sequelize, DataTypes) {
  const device = sequelize.define('device', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    identifierForVendor: {
      type: DataTypes.STRING,
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
