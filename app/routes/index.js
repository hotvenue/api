'use strict';

const fs = require('fs');
const express = require('express');

const indexController = require('../controllers/index');

function addRootRoute(app) {
  const router = express.Router(); // eslint-disable-line new-cap

  router.get('/', indexController.home);

  app.use('/', router);
}

function addOtherRoutes(app) {
  fs.readdirSync(__dirname)
    .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
    .forEach((filename) => {
      app.use(
          `/${filename.replace('.js', '')}`,
          require(`./${filename}`) // eslint-disable-line global-require
      );
    });
}

module.exports = (app) => {
  addRootRoute(app);
  addOtherRoutes(app);

  return app;
};
