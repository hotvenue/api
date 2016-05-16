'use strict';

const fs = require('fs');
const path = require('path');

const models = require('../models');

module.exports = {
  actionList(req, res) {
    res.json({
      result: false,
    });
  },

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

    models.Video
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
};
