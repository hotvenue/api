'use strict';

const config = require('config');

const configS3 = config.get('aws.s3');

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

    urlOriginal: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          configS3.folder.video.original,
          this.getDataValue('id') + this.getDataValue('extension'),
        ].join('/');
      },
    },

    urlEditedA: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          configS3.folder.video.editedA,
          this.getDataValue('id') + this.getDataValue('extension'),
        ].join('/');
      },
    },

    urlPreview: {
      type: DataTypes.VIRTUAL,
      get() {
        return [
          configS3.link,
          configS3.bucket,
          configS3.folder.video.preview,
          `${this.getDataValue('id')}.jpg}`,
        ].join('/');
      },
    },
  }, {
    classMethods: {
      associate: (models) => {
        video.belongsTo(models.user);
        video.belongsTo(models.location);
      },
    },
  });

  return video;
};
