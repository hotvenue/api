'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const multer = require('multer');

const log = require('../../libraries/log');
const cloud = require('../../libraries/cloud');
const jobs = require('../../jobs');

const dataConfig = config.get('folder');
const upload = multer({ dest: dataConfig.upload });

module.exports = {
  create: {
    write: {
      before(req, res, context) {
        upload.single('video')(req, res, () => {
          const videoFile = req.file;
          const ext = videoFile.originalname.substr(videoFile.originalname.lastIndexOf('.'));

          if (!videoFile.mimetype.match(/^video\//)) {
            return context.error(409, 'the file you are trying to upload is not a video');
          }

          context.attributes = { // eslint-disable-line no-param-reassign
            extension: ext,
          };

          return context.continue();
        });
      },
    },

    complete(req, res, context) {
      const video = context.instance;
      const videoFile = req.file;
      const oldVideoPath = videoFile.path;

      if (process.env.NODE_ENV === 'test') {
        const newVideoPath = path.join(videoFile.destination, video.id + video.extension);

        fs.rename(oldVideoPath,
          newVideoPath, (err) => {
            if (err) {
              log.debug('Error while renaming the video');
              log.error(err);
            }

            fs.unlinkSync(oldVideoPath);

            return context.continue();
          });
      } else {
        const newVideoPath = `video/original/${video.id}${video.extension}`;

        cloud.upload(oldVideoPath, newVideoPath, (err/* , data */) => {
          if (err) {
            log.debug('Error while uploading the video');
            log.error(err);
          }

          jobs.videoEdit_A(newVideoPath, newVideoPath.replace('original', 'edited-A'),
            path.join(__dirname, '..', '..', '..', 'test', 'assets', 'watermark.png'));

          return context.continue();

          /*

           return;

           email
           .send({
           from: 'Samantha <samantha@spotvenue.tk>',
           to: 'nicola@ballarini.me',
           cc: 'niccolo@olivieriachille.com',
           subject: 'Aprimi!!!!',
           text: 'Apri l\'allegato!!!!',
           attachments: [{
           filename: 'video.mp4',
           content: fs.createReadStream(oldVideoPath),
           }],
           })
           .then((result) => {
           log.debug('Email sent successfully');
           log.silly(result);

           fs.unlink(oldVideoPath);
           })
           .catch((err1) => {
           log.debug('Error while sending email with the video');
           log.error(err1);

           fs.unlink(oldVideoPath);
           });

           */

          // fs.unlink(oldVideoPath);
        });
      }
    },
  },
};
