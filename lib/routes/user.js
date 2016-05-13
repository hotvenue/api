'use strict';

const express = require('express');

const userController = require('./user');

const router = module.exports = express.Router();

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