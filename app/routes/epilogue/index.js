'use strict';

const fs = require('fs');
const path = require('path');

const models = require('../../models');

module.exports = function addRestRoutes(app) {
  Object.keys(models.sequelize.models).forEach((model) => {
    const resource = app.epilogue.resource({
      model: models.sequelize.models[model],
      // endpoints: [`/${model}`, `/${model}/:id`],
      associations: true,
      actions: ['create', 'list', 'read', 'update', 'delete'],
    });

    const middlewareFilename = `${model}.js`;

    try {
      if (fs.statSync(path.join(__dirname, middlewareFilename)).isFile()) {
        resource.use(require(`./${middlewareFilename}`)); // eslint-disable-line global-require
      }
    } catch (e) {
      // File doesn't exist
    }
  });
};
