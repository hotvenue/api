'use strict';

const express = require('express');

const apiController = require('../controllers/v1');

const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get('/params', apiController.params);

router.post('/log/:severity?', apiController.log);
