const express = require('express');
const path = require('path');

const app = module.exports = express();

require('./lib/middlewares')(app);
require('./lib/routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');

  err.status = 404;

  next(err);
});

// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  res.json({
    result: false,
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});
