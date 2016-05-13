'use strict';

const config = require('config');
const multer = require('multer');
const express = require('express');

const videoController = require('./video');

const dataConfig = config.get('folder');
const upload = multer({ dest: dataConfig.upload });
const router = module.exports = express.Router();

/* POST upload a video. */
router.post('/', upload.single('video'), videoController.actionCreate);
