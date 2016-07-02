'use strict';

const fs = require('fs');
const path = require('path');
const uuid = require('node-uuid');
const config = require('config');
const request = require('request');
const md = require('markdown-it')();

const log = require('../libraries/log');
const cloud = require('../libraries/cloud');
const video = require('../libraries/video');
const email = require('../libraries/email');
const models = require('../models');

const configFolder = config.get('folder');
const configEmail = config.get('email');

module.exports = function videoJob(queue) {
  const delay = 60000;

  function createVideoQueueJob() {
    queue.createMyJob('video-queue')
      .save();
  }

  queue.process('video-loop', (job, done) => {
    video.loop(job.data.videoInput, job.data.videoOutput, job.data.times, done);
  });

  queue.process('video-watermark', (job, done) => {
    video.watermark(job.data.videoInput, job.data.videoOutput,
      job.data.watermark, job.data.position, done);
  });

  queue.process('video-queue', (job, done) => {
    models.video
      .findAll({
        where: {
          sent: false,
          ready: true,
        },
        include: [
          { model: models.user },
        ],
      })
      .then((videos) => {
        log.jobs.silly(`Got ${videos.length} videos`);

        videos.forEach((video2parse) => {
          if (video2parse.user != null) {
            log.jobs.info(`Sending email to ${video2parse.user.email}`);

            email
              .send({
                from: configEmail.from,
                to: video2parse.user.email,
                subject: 'Here is your video!',
                html: md.render(
                  fs.readFileSync(
                    path.join(__dirname, '..', 'docs', 'email-video.md'), {
                      encoding: 'utf8',
                    }
                  )
                ),
                attachments: [{
                  filename: 'video.mp4',
                  content: request(video2parse.urlEditedA),
                }],
              })
              .then((result) => {
                log.jobs.debug('Email sent');
                log.jobs.silly(result);

                video2parse.sent = true; // eslint-disable-line no-param-reassign
                video2parse
                  .save()
                  .catch((errSave) => {
                    log.jobs.debug('Error while saving the video.sent');
                    log.jobs.error(errSave);
                  });
              })
              .catch((err) => {
                log.jobs.debug('Error while sending the email');
                log.jobs.error(err);
              });
          }
        });

        setTimeout(createVideoQueueJob, delay);
        done();
      });
  });

  setTimeout(createVideoQueueJob, delay);

  return {
    videoEdit_A(remoteVideoInput, remoteVideoOutput, watermark, done) {
      const ext = remoteVideoInput.substr(remoteVideoInput.lastIndexOf('.'));

      const tmpFile1 = path.join(configFolder.tmp, uuid.v4()) + ext;
      const tmpFile2 = path.join(configFolder.tmp, uuid.v4()) + ext;
      const tmpFile3 = path.join(configFolder.tmp, uuid.v4()) + ext;

      log.jobs.silly('Job "videoEdit_A" started');

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

              log.jobs.silly('Job "videoEdit_A" finished');

              done();
            });
          }).save();
        }).save();
      });
    },
  };
};
