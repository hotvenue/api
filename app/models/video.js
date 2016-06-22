'use strict';

module.exports = function createVideo(sequelize, DataTypes) {
  const video = sequelize.define('video', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    orphan: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    classMethods: {
      associate: (models) => {
        video.belongsTo(models.user);
        video.belongsTo(models.location);

        video.hasOne(models.tmpCode);
      },
    },
  });

  return video;
};
