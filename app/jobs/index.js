'use strict';

const _ = require('lodash');
const fs = require('fs');
const kue = require('kue');
const options = require('config').get('job');

const queue = kue.createQueue(options.kue);

process.nextTick(kue.app.listen.bind(kue.app, options.app.port));

let jobs = module.exports = {};

fs.readdirSync(__dirname)
  .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
  .forEach((filename) => {
    jobs = _.assign(jobs, require(`./${filename}`)(queue)); // eslint-disable-line global-require
  });
