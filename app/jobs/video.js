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

  queue.process('video-screenshot', (job, done) => {
    video.screenshot(job.data.videoInput, job.data.imageOutput, done);
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
          { model: models.device, include: [{ model: models.location }] },
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
                to: `${configEmail.toName} <${video2parse.user.email}>`,
                subject: 'Here is your video!',
                html: md.render(
                  fs.readFileSync(
                    path.join(__dirname, '..', 'docs', 'email-video.md'), {
                      encoding: 'utf8',
                    }
                  )
                    .replace(/\$\{LOCATION}\$/g, video2parse.device.location.name)
                    .replace(/\$\{HASHTAG}\$/g, video2parse.device.location.hashtag)
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

  const jobs = {
    videoEdit(remoteVideoInput, remoteVideoOutput, remoteWatermark, remoteImageOutput, done) {
      jobs.videoEdit_A(
        remoteVideoInput,
        remoteVideoOutput,
        remoteWatermark,
        remoteImageOutput,
        done);
    },

    videoEdit_A(remoteVideoInput, remoteVideoOutput, remoteWatermark, remoteImageOutput, done) {
      const ext = remoteVideoInput.substr(remoteVideoInput.lastIndexOf('.'));

      const tmpVideo1 = path.join(configFolder.tmp, uuid.v4()) + ext;
      const tmpVideo2 = path.join(configFolder.tmp, uuid.v4()) + ext;
      const tmpVideo3 = path.join(configFolder.tmp, uuid.v4()) + ext;

      const tmpWatermark = `${path.join(configFolder.tmp, uuid.v4())}.png`;
      const tmpPreview = `${path.join(configFolder.tmp, uuid.v4())}.png`;

      log.jobs.silly('Job "videoEdit_A" started');

      cloud.download(remoteWatermark, tmpWatermark)
        .then(() => cloud.download(remoteVideoInput, tmpVideo1))
        .then(() => {
          queue.createMyJob('video-loop', {
            videoInput: tmpVideo1,
            videoOutput: tmpVideo2,
            times: 3,
          }, (/* result */) => {
            log.jobs.debug('Video editing completed');

            queue.createMyJob('video-watermark', {
              videoInput: tmpVideo2,
              videoOutput: tmpVideo3,
              watermark: tmpWatermark,
              position: '0:H-h-0',
            }, (/* result */) => {
              log.jobs.debug('Video watermarking completed');

              cloud.upload(tmpVideo3, remoteVideoOutput)
                .then(() => {
                  log.jobs.debug('Video upload completed');

                  queue.createMyJob('video-screenshot', {
                    videoInput: tmpVideo3,
                    imageOutput: tmpPreview,
                  }, (/* result */) => {
                    log.jobs.debug('Video screenshot completed');

                    cloud.upload(tmpPreview, remoteImageOutput)
                      .then(() => {
                        log.jobs.debug('Screenshot upload completed');

                        fs.unlinkSync(tmpVideo1);
                        fs.unlinkSync(tmpVideo2);
                        fs.unlinkSync(tmpVideo3);
                        fs.unlinkSync(tmpWatermark);
                        fs.unlinkSync(tmpPreview);

                        log.jobs.silly('Job "videoEdit_A" finished');

                        done();
                      })
                      .catch((err) => {
                        log.jobs.debug('Upload failed');
                        log.jobs.debug(err);
                      });
                  }).save();
                })
                .catch((err) => {
                  log.jobs.debug('Video upload failed');
                  log.jobs.debug(err);
                });
            }).save();
          }).save();
        })
        .catch((err) => {
          log.jobs.error('Error in the videoEdit_A job while retrieving resources');
          log.jobs.debug(err);
        });
    },
  };

  return jobs;
};
