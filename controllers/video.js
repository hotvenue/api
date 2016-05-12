'use strict';

const fs = require('fs');
const path = require('path');

const models = require('../models');

module.exports = {
  actionList: function (req, res) {
    res.json({
      result: false
    });
  },

  actionCreate: function (req, res) {
    const videoFile = req.file;
    const ext = videoFile.originalname.substr(videoFile.originalname.lastIndexOf('.'));

    models.Video
      .create({
        extension: ext,
        tmpCode: req.body.tmpCode
      })
      .then(function (video) {
        fs.rename(videoFile.path, path.join(videoFile.destination, video.videoId + video.extension));

        res.json(video);
      });
  }
};