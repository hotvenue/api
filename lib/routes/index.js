const fs = require('fs');
const express = require('express');

const indexController = require('../controllers/index');

function addOtherRoutes(app) {
  fs.readdirSync(__dirname)
    .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
    .forEach((filename) => {
      app.use(
          `/${filename.replace('.js', '')}`,
          require(`./${filename}`) // eslint-disable-line global-require
      );
    });
}

module.exports = (app) => {
  app.use('/', () => {
    const router = express.Router(); // eslint-disable-line new-cap

    router.get('/', indexController.home);

    return router;
  });

  addOtherRoutes(app);

  return app;
};
