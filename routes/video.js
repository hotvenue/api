'use strict';

const config = require('config');
const multer = require('multer');
const express = require('express');

const videoController = require('../controllers/video');

const dataConfig = config.get('data');
const upload = multer({ dest: dataConfig.upload });
const router = module.exports = express.Router();

/* GET test */
router.get('/', videoController.actionList);

/* POST upload a video. */
router.post('/', upload.single('video'), videoController.actionCreate);
