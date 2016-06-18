'use strict';

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

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

  return app;
};
