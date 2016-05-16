'use strict';

const config = require('config');
const multer = require('multer');
const express = require('express');

const videoController = require('../controllers/video');

const dataConfig = config.get('folder');
const upload = multer({ dest: dataConfig.upload });
const router = module.exports = express.Router(); // eslint-disable-line new-cap

/* POST upload a video. */
router.post('/', upload.single('video'), videoController.actionCreate);
