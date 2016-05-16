'use strict';

const express = require('express');

const userController = require('../controllers/user');

const router = module.exports = express.Router(); // eslint-disable-line new-cap

/**
 * List
 */
router.get('/', userController.actionList);

/**
 * Create
 */
router.post('/', userController.actionCreate);

/**
 * Retrieve
 */
router.get('/:id', userController.actionRetrieve);

/**
 * Update
 */
router.put('/:id', userController.actionUpdate);
