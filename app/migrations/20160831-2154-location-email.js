'use strict';

module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('locations')
      .then((fields) => {
        if (!fields.hasOwnProperty('email')) {
          return models.sequelize.queryInterface.addColumn('locations', 'email', {
            type: fields.name.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
