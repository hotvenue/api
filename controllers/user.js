'use strict';

const models = require('../models');

const actions = module.exports = {
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
  },

  actionRetrieve: function (req, res) {
    models.User
      .findById(req.params.id)
      .then(function (user) {
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({
            error: 'no users found'
          });
        }
      })
      .catch(function (err) {
        res.status(404).json(err);
      });
  },

  actionUpdate: function (req, res) {
    models.User
      .update(req.body, {
        where: {
          userId: req.params.id
        }
      })
      .then(function (affected) {
        if (affected) {
          actions.actionRetrieve(req, res);
        } else {
          res.status(404).json({
            error: 'no users found'
          });
        }
      })
      .catch(function (err) {
        res.status(409).json(err);
      });
  }
};