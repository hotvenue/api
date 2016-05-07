'use strict';

const express = require('express');

const videoController = require('../controllers/video');

const router = module.exports = express.Router();

/* GET test */
router.get('/', videoController.actionList);

/* POST upload a video. */
router.post('/', videoController.actionCreate);
