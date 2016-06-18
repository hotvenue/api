'use strict';

const path = require('path');
const config = require('config');
const moment = require('moment');
const winston = require('winston');

const options = config.get('logger');

const loggerNames = [
  'default',
  'server',
  'db',
];

function timestamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS Z');
}

function loggerFactory(label) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        label: label === 'default' ? null : label,
        level: label === 'server' ? 'warn' : 'silly',
        colorize: options.console.colorize,
        timestamp,
      }),

      new winston.transports.File({
        level: 'silly',
        timestamp: label === 'server' ? false : timestamp,
        filename: path.join(options.file.path, `${label}.log`),
        maxsize: 5 * 1024 * 1024,
        json: false,
        showLevel: label !== 'server',
      }),
    ],
  });
}

const log = module.exports = {};

loggerNames.forEach((loggerName) => {
  log[loggerName] = loggerFactory(loggerName);
});

Object.keys(log.default.levels).forEach((level) => {
  log[level] = log.default[level];
});
