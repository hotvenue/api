'use strict';


module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('videos')
      .then((fields) => {
        if (!fields.hasOwnProperty('home')) {
          return models.sequelize.queryInterface.addColumn('videos', 'home', {
            type: fields.ready.type,
            defaultValue: false,
          });
        }

        return true;
      });
  },

  down(/* models */) {},
};
