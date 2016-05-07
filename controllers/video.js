'use strict';

module.exports = {
  actionList: function (req, res) {
    res.json({
      result: false
    });
  },

  actionCreate: function (req, res) {
    res.json({
      result: true
    });
  }
};