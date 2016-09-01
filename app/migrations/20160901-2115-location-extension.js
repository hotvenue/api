'use strict';

module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('locations')
      .then((fields) => {
        if (fields.hasOwnProperty('extension')) {
          return models.sequelize.queryInterface.removeColumn('locations', 'extension');
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
