'use strict';

module.exports = {
  up(models) {
    let videoFields;
    let deviceFields;

    models.sequelize.queryInterface.describeTable('videos')
      .then((fields) => {
        videoFields = fields;

        return models.sequelize.queryInterface.describeTable('devices');
      })

      .then((fields) => {
        deviceFields = fields;

        if (videoFields.hasOwnProperty('locationId')) {
          return models.sequelize.queryInterface.removeColumn('videos', 'locationId');
        }

        return true;
      })

      .then(() => {
        if (!videoFields.hasOwnProperty('deviceId')) {
          return models.sequelize.queryInterface.addColumn('videos', 'deviceId', {
            type: deviceFields.id.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
