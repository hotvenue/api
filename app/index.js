'use strict';

const express = require('express');

const log = require('./libraries/log');

const app = module.exports = express();

require('./middlewares/index')(app);
require('./routes/index')(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');

  err.status = 404;

  next(err);
});

// error handlers
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (process.env.NODE_ENV !== 'test') {
    log.server.error(err);
  }

  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {},
  });
});
