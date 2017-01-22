'use strict';

const express = require('express');

const v1Controller = require('../controllers/v1');

const router = module.exports = express.Router(); // eslint-disable-line new-cap

router.get('/params', v1Controller.params);

router.get('/config', v1Controller.config);

router.post('/log/:severity?', v1Controller.log);

router.post('/job/:job?', v1Controller.job);

router.get('/zip/:locationId?', v1Controller.zip);

router.get('/ec2', v1Controller.ec2List);

router.get('/ec2/launch', v1Controller.ec2Launch);
