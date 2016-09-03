'use strict';

module.exports = {
  up(models) {
    models.sequelize.queryInterface.describeTable('users')
      .then((fields) => {
        if (!fields.hasOwnProperty('telegramId')) {
          return models.sequelize.queryInterface.addColumn('users', 'telegramId', {
            type: fields.email.type,
          });
        }

        return true;
      });
  },

  down(/* models */) {

  },
};
