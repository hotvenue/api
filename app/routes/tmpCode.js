'use strict';

const express = require('express');

const tmpCodeController = require('../controllers/tmpCode');

const router = module.exports = express.Router(); // eslint-disable-line new-cap

/**
 * Create
 */
router.post('/', tmpCodeController.actionCreate);
