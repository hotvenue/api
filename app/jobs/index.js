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

queue.createMyJob = function createMyJob(name, params) {
  // eslint-disable-next-line no-param-reassign
  params = params || {};

  const job = queue.create(name, params);

  job
    .removeOnComplete(true)
    .on('complete', () => {
      log.jobs.debug(`Job ${name} completed`);
    })
    .on('failed attempt', (errorMessage) => {
      log.jobs.debug(`Job ${name} failed`);
      log.jobs.error(errorMessage);
    })
    .on('failed', (errorMessage) => {
      log.jobs.debug(`Job ${name} failed`);
      log.jobs.error(errorMessage);
    })
    .on('progress', (progress) => {
      log.jobs.silly(`Job ${name} progress: ${progress}`);
    });

  return job;
};

process.nextTick(kue.app.listen.bind(kue.app, options.app.port));
process.once('SIGTERM', () => {
  queue.shutdown(5000, (err) => {
    log.jobs.debug('Kue shutdown: ', err || '');
    process.exit(0);
  });
});

let jobs = module.exports = {};

fs.readdirSync(__dirname)
  .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
  .forEach((filename) => {
    jobs = _.assign(jobs, require(`./${filename}`)(queue)); // eslint-disable-line global-require
  });
