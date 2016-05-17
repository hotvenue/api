'use strict';

const fs = require('fs');
const path = require('path');

const models = require('../models');

module.exports = {
  actionCreate(req, res) {
    const videoFile = req.file;
    const ext = videoFile.originalname.substr(videoFile.originalname.lastIndexOf('.'));

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
        fs.rename(videoFile.path,
          path.join(videoFile.destination, video.videoId + video.extension));

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
          return video.setTmpCode(req.body.tmpCode);
        }

        return video;
      })
      .then((tmpCode) => {
        if (tmpCode) {
          return theVideo.reload({
            include: [{ model: models.tmpCode, include: [{ model: models.video }] }],
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
};
