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

  queue.process('video-watermark', (job, done) => {
    video.watermark(job.data.videoInput, job.data.videoOutput,
      job.data.watermark, job.data.position, done);
  });

  return {
    videoEdit_A(remoteVideoInput, remoteVideoOutput, watermark) {
      const ext = remoteVideoInput.substr(remoteVideoInput.lastIndexOf('.'));

      const tmpFile1 = path.join(configFolder.tmp, uuid.v4()) + ext;
      const tmpFile2 = path.join(configFolder.tmp, uuid.v4()) + ext;
      const tmpFile3 = path.join(configFolder.tmp, uuid.v4()) + ext;

      cloud.download(remoteVideoInput, tmpFile1, (err) => {
        if (err) {
          return;
        }

        log.jobs.debug('Downloaded', remoteVideoInput);

        queue.createMyJob('video-loop', {
          videoInput: tmpFile1,
          videoOutput: tmpFile2,
          times: 3,
        }, (/* result */) => {
          log.jobs.debug('Video editing completed');

          queue.createMyJob('video-watermark', {
            videoInput: tmpFile2,
            videoOutput: tmpFile3,
            watermark,
            position: '5:H-h-5',
          }, () => {
            log.jobs.debug('Video watermarking complete');

            cloud.upload(tmpFile3, remoteVideoOutput, (errUpload) => {
              if (errUpload) {
                log.jobs.debug('Upload failed');
                log.jobs.debug(errUpload);

                return;
              }

              log.jobs.debug('Upload completed');
            });
          }).save();
        }).save();
      });
    },
  };
};
