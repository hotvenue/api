'use strict';

module.exports = function video(sequelize, DataTypes) {
  const TmpCode = sequelize.define('TmpCode', {
    tmpCode: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  }, {
    classMethods: {
      associate: (models) => {
        TmpCode.belongsTo(models.User);
        TmpCode.belongsTo(models.Video);
      },
    },
  });

  return TmpCode;
};
