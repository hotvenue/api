'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const Sequelize = require('sequelize');

const options = config.get('database');
const sequelize = new Sequelize(options.database, options.username, options.password, options);

const db = module.exports = {};

fs.readdirSync(__dirname)
  .filter(function (filename) {
    return filename !== 'index.js' && filename.substr(-3) === '.js';
  })
  .forEach(function (filename) {
    const model = sequelize.import(path.join(__dirname, filename));

    db[model.name] = model;
  });

Object.keys(db).forEach(function (modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.Sequelize = Sequelize;
db.sequelize = sequelize;