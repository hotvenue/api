'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const md = require('markdown-it')();

const log = require('../libraries/log');
const cloud = require('../libraries/cloud');
const email = require('../libraries/email');
const models = require('../models');

const configJobs = config.get('jobs');
const configEmail = config.get('email');
const configApp = config.get('app');

module.exports = function maidJob() {
  const limit = 10;

  function maidSendVideo() {
    return models.video
      .findAll({
        where: {
          sent: false,
          ready: true,
        },
        limit,
        include: [
          { model: models.user },
          { model: models.device, include: [{ model: models.location }] },
        ],
      })
      .then((videos) => {
        log.jobs.debug(`Got ${videos.length} videos to send`);

        return Promise.all(videos.map((video2parse) => {
          if (video2parse.user != null) {
            log.jobs.info(`Sending email to ${video2parse.user.email}`);

            const emailFile = video2parse.device.location.email === configEmail.events ?
              'email-video-promo.md' : 'email-video.md';

            return cloud.download(video2parse.urlEditedARelative)
              .then((videoStream) => email.send({
                from: configEmail.from,
                to: `${configEmail.toName} <${video2parse.user.email}>`,
                subject: 'Here is your video!',
                html: md.render(
                  fs.readFileSync(
                    path.join(__dirname, '..', 'docs', emailFile), {
                      encoding: 'utf8',
                    }
                  )
                    .replace(/\$\{LOCATION}\$/g, video2parse.device.location.name)
                    .replace(/\$\{HASHTAG}\$/g, video2parse.device.location.hashtag)
                ),
                attachments: [{
                  filename: video2parse.name,
                  content: videoStream,
                }],
              }))
              .then((result) => {
                log.jobs.debug('Email sent');
                log.jobs.silly(result);

                video2parse.sent = true; // eslint-disable-line no-param-reassign
                return video2parse
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

          return video2parse.destroy();
        }));
      });
  }

  function maidCheckVideo() {
    return models.video
      .findAll({
        where: {
          ready: false,
        },
        limit,
        include: [
          { model: models.user },
          { model: models.device, include: [{ model: models.location }] },
        ],
      })
      .then((videos) => {
        log.jobs.silly(`Got ${videos.length} videos to check`);

        return Promise.all(videos.map((video2check) => {
          if (
            !video2check.id
            ||
            !video2check.extension
            ||
            !video2check.device
            ||
            !video2check.device.location
          ) {
            log.jobs.info(`Video ${video2check.id} is a bad one: destroying`);

            return video2check.destroy();
          }

          const id = video2check.id;
          const ext = video2check.extension;
          const locationId = video2check.device.location.id;

          let isTmpOriginal = true;
          let isOriginal = true;
          let isOthers = true;

          const tmpOriginal = `app/video/tmp-original/${id}_${locationId}${ext}`;
          const original = `app/video/original/${id}${ext}`;
          const editedA = `app/video/edited-A/${id}${ext}`;
          const preview = `app/video/preview/${id}${configApp.extension.preview}`;

          return Promise.resolve()
            .then(() => cloud.download(tmpOriginal))
            .catch(() => {
              isTmpOriginal = false;
            })
            .then(() => cloud.download(original))
            .catch(() => {
              isOriginal = false;
            })
            .then(() => Promise.all([
              cloud.download(editedA),
              cloud.download(preview),
            ]))
            .catch(() => {
              isOthers = false;
            })
            .then(() => {
              // There's tmp-original -> wait next iteration
              if (isTmpOriginal) {
                log.jobs.info(`Video ${video2check.id} not yet processed by lambda ConvertVideo`);

                return true;
              }

              // No original -> destroy video
              if (!isOriginal) {
                log.jobs.info(`Video ${video2check.id} has no original: destroying`);

                return video2check.destroy();
              }

              // No others (edited + preview)
              if (!isOthers) {
                log.jobs.info(`Video ${video2check.id} has no edited: copying back to tmp`);

                return cloud.copy(original, tmpOriginal);
              }

              // If everything ok
              log.jobs.info(`Video ${video2check.id} is ok: flagging ready`);

              video2check.ready = true; // eslint-disable-line no-param-reassign
              return video2check.save();
            });
        }));
      });
  }

  function maid() {
    if (process.env.NODE_ENV === 'test') {
      return Promise.resolve();
    }

    return Promise.resolve()
      .then(() => maidCheckVideo())
      .then(() => maidSendVideo());
  }

  if (configJobs.autostart) {
    setInterval(maid, configJobs.maid.delay);
  }

  return {
    maid,
  };
};
