'use strict';

const moment = require('moment');
const winston = require('winston');

require('winston-elasticsearch');

const cloud = require('./cloud');

const loggerNames = [
  'default',
  'server',
  'db',
  'aws',
  'jobs',
  'telegram',
  'analyticsFrame',
];

// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

function timestamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS Z');
}

function loggerFactory(label) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        label: label === 'default' ? null : label,
        level: label === 'server' ? 'warn' : 'info',
        silent: label === 'analyticsFrame',
        timestamp,
      }),

      new winston.transports.Elasticsearch({
        client: cloud.es,
        indexPrefix: 'hotvenue-server',
        level: 'silly',
        messageType: label,
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
