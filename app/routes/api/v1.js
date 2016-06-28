'use strict';

const express = require('express');

const indexController = require('../../controllers/index');

const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get('/', indexController.home);
