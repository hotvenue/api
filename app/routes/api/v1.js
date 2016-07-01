'use strict';

const express = require('express');

const apiController = require('../../controllers/api/v1');

const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get('/params', apiController.params);
