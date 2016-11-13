'use strict';


module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('videos')
      .then((fields) => {
        if (!fields.hasOwnProperty('privacy')) {
          return models.sequelize.queryInterface.addColumn('videos', 'privacy', {
            type: fields.extension.type,
            defaultValue: '{"name":true,"publish":true}',
          });
        }

        return true;
      });
  },

  down(/* models */) {},
};
