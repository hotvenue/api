'use strict';

const models = require('../models');

module.exports = {
  actionList(req, res) {
    models.user.findAll({
      include: [
        { model: models.video, include: [{ model: models.location }] },
        { model: models.tmpCode, include: [{ model: models.video }] },
      ],
    }).then((users) => {
      res.json(users);
    });
  },

  actionCreate(req, res) {
    models.user
      .findOrCreate({
        where: req.body,
      })
      .then((args) => {
        const user = args[0];
        // const created = args[1];

        res.json(user);
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },

  actionRetrieve(req, res) {
    models.user
      .findById(req.params.id, {
        include: [
          { model: models.video, include: [{ model: models.location }] },
        ],
      })
      .then((user) => {
        if (user) {
          res.json(user);
        } else {
          res.status(404).json({
            error: 'no users found',
          });
        }
      })
      .catch((err) => {
        res.status(404).json(err);
      });
  },

  actionUpdate(req, res) {
    models.user
      .findById(req.params.id)
      .then((user) => {
        if (!user) {
          res.status(404).json({
            error: 'no users found',
          });

          return false;
        }

        const user2edit = user;

        ['email'].forEach((field) => {
          if (req.body[field]) {
            user2edit[field] = req.body[field];
          }
        });

        if (req.body.tmpCode) {
          user2edit.addTmpCode(req.body.tmpCode);
        }

        return user2edit.save();
      })
      .then((user) => {
        if (user) {
          return user.reload({
            include: [{ model: models.tmpCode, include: [{ model: models.video }] }],
          });
        }

        return false;
      })
      .then((user) => {
        if (user) {
          res.json(user);
        }
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },
};
