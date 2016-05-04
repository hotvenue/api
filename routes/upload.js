'use strict';

var express = require('express');
var router = express.Router();

/* GET test */
router.get('/', function (req, res, next) {
  res.json({
    result: false
  });
});

/* POST upload a video. */
router.post('/', function(req, res, next) {
  console.log(req);
  
  res.json({
    result: true
  });
});

module.exports = router;
