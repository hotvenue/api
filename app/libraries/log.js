'use strict';

const _ = require('lodash');
const path = require('path');
const config = require('config');
const moment = require('moment');
const winston = require('winston');

const options = config.get('log');

const loggerNames = [
  'default',
  'server',
  'db',
  'aws',
  'jobs',
];

function timestamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS Z');
}

function loggerFactory(label) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console(_.defaults(options[label] || {}, options.console || {}, {
        label: label === 'default' ? null : label,
        level: label === 'server' ? 'warn' : 'silly',
        timestamp,
      })),

      new winston.transports.File(_.defaults(options[label] || {}, options.file || {}, {
        timestamp: label === 'server' ? false : timestamp,
        filename: path.join(options.file.path, `${label}.log`),
        showLevel: label !== 'server',
      })),
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
