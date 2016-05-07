var express = require('express');
var router = module.exports = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    result: true
  });
});
