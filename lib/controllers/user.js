const models = require('../models');

const actions = module.exports = {
  actionList(req, res) {
    models.User.findAll({
      include: [
        { model: models.Video, include: [{ model: models.Location }] },
      ],
    }).then((users) => {
      res.json(users);
    });
  },

  actionCreate(req, res) {
    models.User
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
    models.User
      .findById(req.params.id, {
        include: [
          { model: models.Video, include: [{ model: models.Location }] },
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
    models.User
      .update(req.body, {
        where: {
          userId: req.params.id,
        },
      })
      .then((affected) => {
        if (affected) {
          actions.actionRetrieve(req, res);
        } else {
          res.status(404).json({
            error: 'no users found',
          });
        }
      })
      .catch((err) => {
        res.status(409).json(err);
      });
  },
};
