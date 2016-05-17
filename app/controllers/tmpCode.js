'use strict';

const models = require('../models');

module.exports = {
  actionCreate(req, res) {
    models.tmpCode
      .create()
      .then((tmpCode) => {
        res.json(tmpCode);
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },
};
