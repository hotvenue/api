'use strict';

const fs = require('fs');
const express = require('express');

module.exports = function (app) {
  app.use('/', getRootRouter());

  addOtherRoutes(app);

  return app;
};

function getRootRouter () {
  const indexController = require('../controllers/index');
  const router = express.Router();

  router.get('/', indexController.home);

  return router;
}

function addOtherRoutes (app) {
  fs.readdirSync(__dirname)
    .filter(function (filename) {
      return filename !== 'index.js' && filename.substr(-3) === '.js';
    })
    .forEach(function (filename) {
      app.use(`/${filename.replace('.js', '')}`, require(`./${filename}`));
    });
}