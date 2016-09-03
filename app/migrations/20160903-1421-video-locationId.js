'use strict';

module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('videos')
      .then((fields) => {
        if (!fields.hasOwnProperty('locationId')) {
          return models.sequelize.queryInterface.addColumn('videos', 'locationId', {
            type: fields.id.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
