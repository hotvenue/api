'use strict';

const models = require('../models');

module.exports = {
  actionList: function (req, res) {
    models.User.findAll({
      include: [
        { model: models.Video, include: [{ model: models.Location }]}
      ]
    }).then(function (users) {
      res.json(users);
    });
  },

  actionCreate: function (req, res) {
    models.User
      .findOrCreate({
        where: req.body
      })
      .then(function (args) {
        const user = args[0];
        const created = args[1];

        res.json(user);
      })
      .catch(function (err) {
        res.status(409).json(err);
      });
  }
};