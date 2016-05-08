'use strict';

const express = require('express');

const userController = require('../controllers/user');

const router = module.exports = express.Router();

/**
 * List
 */
router.get('/', userController.actionList);

/**
 * Create
 */
router.post('/', userController.actionCreate);
