'use strict';

const _ = require('lodash');
const fs = require('fs');
const kue = require('kue');
const config = require('config');

const log = require('../libraries/log');

const options = config.get('job');
const optionsRedis = config.get('redis');

options.kue.redis = _.assign(optionsRedis, options.kue.redis);

const queue = kue.createQueue(options.kue);
queue.watchStuckJobs();

process.nextTick(kue.app.listen.bind(kue.app, options.app.port));

let jobs = module.exports = {};

fs.readdirSync(__dirname)
  .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
  .forEach((filename) => {
    jobs = _.assign(jobs, require(`./${filename}`)(queue)); // eslint-disable-line global-require
  });
