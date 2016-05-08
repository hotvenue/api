'use strict';

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

module.exports = function (app) {
  if (app.get('env') !== 'test') {
    app.use(logger(app.get('env') === 'dev' ? 'dev' : 'combined'));
  }
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  
  return app;
};