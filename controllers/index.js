'use strict';

const packageObj = require('../package.json');

module.exports = {
  home: function (req, res) {
    res.json(packageObj);
  }
};