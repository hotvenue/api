'use strict';

module.exports = function (sequelize, DataTypes) {
  const Video = sequelize.define('Video', {
    videoId: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },

    extension: {
      type: DataTypes.STRING,
      allowNull: false
    },

    tmpCode: DataTypes.STRING
  }, {
    classMethods: {
      associate: function (models) {
        Video.belongsTo(models.User);
        Video.belongsTo(models.Location);
      }
    }
  });

  return Video;
};