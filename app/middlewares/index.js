'use strict';

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const epilogue = require('epilogue');

const models = require('../models');
const log = require('../libraries/log');

const stream = {
  write(message/* , encoding */) {
    log.server.info(message);
  },
};

module.exports = (app) => {
  if (app.get('env') !== 'test') {
    app.use(logger(app.get('env') === 'development' ? 'dev' : 'combined', { stream }));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.epilogue = epilogue; // eslint-disable-line no-param-reassign
  app.epilogue.initialize({
    app,
    sequelize: models.sequelize,
  });

  return app;
};
