'use strict';


module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('devices')
      .then((fields) => {
        if (!fields.hasOwnProperty('name')) {
          return models.sequelize.queryInterface.addColumn('devices', 'name', {
            type: fields.identifierForVendor.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
