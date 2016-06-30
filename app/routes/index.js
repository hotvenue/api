'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');

const models = require('../models');

const indexController = require('../controllers/index');

const epilogueFolder = 'epilogue';

function addRootRoute(app) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.get('/', indexController.home);

  app.use('/', router);
}

function addOtherRoutes(app, relativePath) {
  let dirpath = __dirname;

  if (relativePath) {
    dirpath = path.join(dirpath, relativePath);
  }

  fs.readdirSync(dirpath)
    .forEach((filename) => {
      if (filename === 'index.js' || filename === epilogueFolder) {
        return;
      }

      const filepath = path.join(dirpath, filename);

      if (fs.statSync(filepath).isDirectory()) {
        addOtherRoutes(app, path.join(relativePath || '', filename));
      } else {
        const relativeFilePath = path.join(relativePath || '', filename.replace('.js', ''))
          .replace(/\\/, '/');

        app.use(
          `/${relativeFilePath}`,
          require(`./${relativeFilePath}`) // eslint-disable-line global-require
        );
      }
    });
}

function addRestRoutes(app) {
  Object.keys(models.sequelize.models).forEach((model) => {
    const resource = app.epilogue.resource({
      model: models.sequelize.models[model],
      endpoints: [`/${model}`, `/${model}/:id`],
      associations: true,
    });

    const middlewareFilename = path.join(epilogueFolder, `${model}.js`);

    try {
      if (fs.statSync(path.join(__dirname, middlewareFilename)).isFile()) {
        resource.use(require(`./${middlewareFilename}`)); // eslint-disable-line global-require
      }
    } catch (e) {
      // File doesn't exist
    }
  });
}

module.exports = (app) => {
  addRootRoute(app);
  addOtherRoutes(app);
  addRestRoutes(app);

  return app;
};
