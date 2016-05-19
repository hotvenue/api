'use strict';

const config = require('config');
const multer = require('multer');
const express = require('express');

const videoController = require('../controllers/video');

const dataConfig = config.get('folder');
const upload = multer({ dest: dataConfig.upload });
const router = module.exports = express.Router(); // eslint-disable-line new-cap

/**
 * List
 * Params:
 * - offset int [0]
 * - limit  int [10]
 */
router.get('/', videoController.actionList);

/**
 * Create (with upload)
 */
router.post('/', upload.single('video'), videoController.actionCreate);

/**
 * Update
 */
router.put('/:id', videoController.actionUpdate);
