'use strict';

const models = require('../models');

const actions = module.exports = {
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

        return user2edit.save();
      })
      .then((user) => {
        if (req.body.tmpCode) {
          return user.addTmpCode(req.body.tmpCode)
            .then(actions.checkUserVideo(req.body.tmpCode));
        }

        return user;
      })
      .then((user) => {
        if (user) {
          return user.reload({
            include: [
              { model: models.tmpCode, include: [{ model: models.video }] },
              { model: models.video },
            ],
          });
        }

        return false;
      })
      .then((user) => {
        if (user) {
          res.json(user);
        } else {
          res.status(404);
        }
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },

  checkUserVideo(tmpCode) {
    return (user) =>
      models.user
        .find({
          where: {
            id: user.id,
          },
          include: [{
            model: models.tmpCode,
            where: { id: tmpCode },
            include: [{ model: models.video }],
          }],
        })
        .then((userWithTmpCode) => {
          if (userWithTmpCode.tmpCodes && userWithTmpCode.tmpCodes[0].video) {
            return user.addVideo(userWithTmpCode.tmpCodes[0].video.id);
          }

          return userWithTmpCode || user;
        });
  },
};
