'use strict';

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

module.exports = function (app) {
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  
  return app;
};