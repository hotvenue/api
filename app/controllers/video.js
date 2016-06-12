'use strict';

const fs = require('fs');
const path = require('path');

const cloud = require('../libraries/cloud');
const models = require('../models');
const email = require('../libraries/email');

const actions = module.exports = {
  actionList(req, res) {
    const query = req.query;

    const offset = query.offset || 0;
    const limit = query.limit || 10;

    models.video
      .findAll({
        offset,
        limit,

        order: [
          ['createdAt', 'DESC'],
        ],
      })
      .then((videos) => {
        res.json(videos);
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },

  actionCreate(req, res) {
    const videoFile = req.file;
    const ext = videoFile.originalname.substr(videoFile.originalname.lastIndexOf('.'));

    console.log(videoFile);

    if (!videoFile.mimetype.match(/^video\//)) {
      res.status(409);
      res.json({
        success: false,
        message: 'the file you are trying to upload is not a video',
      });

      return;
    }

    models.video
      .create({
        extension: ext,
        tmpCode: req.body.tmpCode,
      })
      .then((video) => {
        const oldVideoPath = videoFile.path;

        if (process.env.NODE_ENV === 'test') {
          const newVideoPath = path.join(videoFile.destination, video.id + video.extension);

          fs.rename(oldVideoPath,
            newVideoPath, (err) => {
              if (err) {
                console.error(err);
              }

              fs.unlink(oldVideoPath);
            });
        } else {
          const newVideoPath = `video/original/${video.id}${video.extension}`;

          cloud.upload(oldVideoPath, newVideoPath, (err/* , data */) => {
            if (err) {
              console.error(err);
            }

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
                console.log(result);
              })
              .catch((err1) => {
                console.log(err1);
              });

            // fs.unlink(oldVideoPath);
          });
        }

        res.json(video);
      });
  },

  actionUpdate(req, res) {
    let theVideo;

    models.video
      .findById(req.params.id)
      .then((video) => {
        if (!video) {
          res.status(404).json({
            error: 'no video found',
          });

          return false;
        }

        const video2edit = video;

        [].forEach((field) => {
          if (req.body[field]) {
            video2edit[field] = req.body[field];
          }
        });

        return video2edit.save();
      })
      .then((video) => {
        theVideo = video;

        if (req.body.tmpCode) {
          return video.setTmpCode(req.body.tmpCode)
            .then(actions.checkVideoUser(video));
        }

        return video;
      })
      .then((tmpCode) => {
        if (tmpCode) {
          return theVideo.reload({
            include: [
              { model: models.tmpCode, include: [{ model: models.video }] },
              { model: models.user },
            ],
          });
        }

        return theVideo;
      })
      .then((video) => {
        if (video) {
          res.json(video);
        }
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },

  checkVideoUser(video) {
    return (tmpCode) =>
      models.video
        .find({
          where: {
            id: video.id,
          },
          include: [{
            model: models.tmpCode,
            where: { id: tmpCode.id },
            include: [{ model: models.user }],
          }],
        })
        .then((videoWithTmpCode) => {
          if (videoWithTmpCode.tmpCode && videoWithTmpCode.tmpCode.user) {
            return video.setUser(videoWithTmpCode.tmpCode.user)
              .then(() => tmpCode);
          }

          return tmpCode;
        });
  },
};
