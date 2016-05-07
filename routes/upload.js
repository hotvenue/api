'use strict';

var express = require('express');
var router = module.exports = express.Router();

/* GET test */
router.get('/', function (req, res) {
  res.json({
    result: false
  });
});

/* POST upload a video. */
router.post('/', function(req, res) {
  console.log(req);
  
  res.json({
    result: true
  });
});
