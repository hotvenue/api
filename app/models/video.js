'use strict';

module.exports = function video(sequelize, DataTypes) {
  const Video = sequelize.define('Video', {
    videoId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    tmpCode: DataTypes.STRING,
  }, {
    classMethods: {
      associate: (models) => {
        Video.belongsTo(models.User);
        Video.belongsTo(models.Location);

        Video.hasOne(models.TmpCode);
      },
    },
  });

  return Video;
};
