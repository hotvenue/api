'use strict';

module.exports = {
  up(models) {
    let locationFields;

    models.sequelize.queryInterface.describeTable('locations')
      .then((fields) => {
        locationFields = fields;

        if (!locationFields.hasOwnProperty('hashtag')) {
          return models.sequelize.queryInterface.addColumn('locations', 'hashtag', {
            type: locationFields.name.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
