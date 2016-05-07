const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const upload = require('./routes/upload');

const app = module.exports = express();

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', routes);
app.use('/upload', upload);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');

  err.status = 404;

  next(err);
});

// error handlers
app.use(function(err, req, res) {
  res.status(err.status || 500);

  res.json({
    result: false,
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});
