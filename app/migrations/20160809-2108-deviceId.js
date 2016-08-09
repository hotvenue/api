'use strict';

module.exports = {
  up(models) {
    let deviceFields;
    let locationFields;

    models.sequelize.queryInterface.describeTable('devices')
      .then((fields) => {
        deviceFields = fields;

        return models.sequelize.queryInterface.describeTable('locations');
      })

      .then((fields) => {
        locationFields = fields;

        if (!deviceFields.hasOwnProperty('deviceId')) {
          return models.sequelize.queryInterface.addColumn('devices', 'identifierForVendor', {
            type: deviceFields.id.type,
          })
            .then(() =>
              models.sequelize.queryInterface.changeColumn('devices', 'id', locationFields.id));
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
