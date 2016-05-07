'use strict';

const express = require('express');
const fs = require('fs');

module.exports = function (app) {
  app.use('/', getRootRouter());

  addOtherRoutes(app);

  return app;
};

function getRootRouter () {
  const indexController = require('../controllers');
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