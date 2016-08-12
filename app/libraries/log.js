'use strict';

const _ = require('lodash');
const path = require('path');
const config = require('config');
const moment = require('moment');
const winston = require('winston');
const Elasticsearch = require('winston-elasticsearch');

const options = config.get('log');

const cloud = require('./cloud');

const loggerNames = [
  'default',
  'server',
  'db',
  'aws',
  'jobs',
  'analytics',
];

// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

function timestamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS Z');
}

function loggerFactory(label) {
  return new winston.Logger({
    transports: [
      new winston.transports.Console(_.defaults(options[label] || {}, options.console || {}, {
        label: label === 'default' ? null : label,
        level: label === 'server' ? 'warn' : 'info',
        silent: label === 'analytics',
        timestamp,
      })),

      new Elasticsearch(_.defaults(options.elasticsearch || {}, {
        indexPrefix: label,
        level: 'silly',
        client: cloud.es,
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
