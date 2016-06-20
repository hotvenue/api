'use strict';

const path = require('path');
const uuid = require('node-uuid');
const config = require('config');

const log = require('../libraries/log');
const cloud = require('../libraries/cloud');
const video = require('../libraries/video');

const configFolder = config.get('folder');

module.exports = function videoJob(queue) {
  queue.process('video-loop', (job, done) => {
    video.loop(job.data.videoInput, job.data.videoOutput, job.data.times, done);
  });

  queue.process('video-loop', (job, done) => {
    video.watermark(job.data.videoInput, job.data.videoOutput,
      job.data.watermark, job.data.position, done);
  });

  return {
    videoEdit_A(remoteVideoInput, remoteVideoOutput, watermark) {
      const tmpFile1 = path.join(configFolder.tmp, uuid.v4());
      const tmpFile2 = path.join(configFolder.tmp, uuid.v4());

      const ext = remoteVideoInput.substr(remoteVideoInput.lastIndexOf('.'));

      cloud.download(remoteVideoInput, tmpFile1, (err) => {
        if (err) {
          return;
        }

        log.jobs.debug('Downloaded', remoteVideoInput);

        const job = queue.create('video-loop', {
          videoInput: tmpFile1,
          videoOutput: tmpFile2 + ext,
          times: 3,
        }).save();

        job
          .on('enqueue', () => {
            log.jobs.debug('Job enqueued');
          })
          .on('start', () => {
            log.jobs.debug('Job enqueued');
          })
          .on('complete', (result) => {
            log.jobs.debug('Job completed with data, %j', result);
          })
          .on('failed attempt', (errorMessage, doneAttempts) => {
            log.jobs.debug('Job failed');
            log.jobs.error(errorMessage);
          })
          .on('failed', (errorMessage) => {
            log.jobs.debug('Job failed');
            log.jobs.error(errorMessage);
          })
          .on('progress', (progress, data) => {
            log.jobs.silly('Job progress: %j', progress);
          });
      });
    },
  };
};
