'use strict';

module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('videos')
      .then((fields) => {
        if (!fields.hasOwnProperty('hash')) {
          return models.sequelize.queryInterface.addColumn('videos', 'hash', {
            type: fields.extension.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
