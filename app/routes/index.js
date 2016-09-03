'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');

const indexController = require('../controllers/index');

const addRestRoutes = require('./epilogue');
const addTelegramRoutes = require('./telegram');

const thirdPartyRoutes = [
  'epilogue',
  'telegram',
];

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
      if (filename === 'index.js') {
        return;
      }

      if (thirdPartyRoutes.indexOf(filename) !== -1) {
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

module.exports = (app) => {
  addRootRoute(app);
  addOtherRoutes(app);
  addRestRoutes(app);

  // addTelegramRoutes();

  return app;
};
