'use strict';

module.exports = function createTmpCode(sequelize, DataTypes) {
  const tmpCode = sequelize.define('tmpCode', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  }, {
    classMethods: {
      associate: (models) => {
        tmpCode.belongsTo(models.user);
        tmpCode.belongsTo(models.video);
      },
    },
  });

  return tmpCode;
};
