'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const Sequelize = require('sequelize');

const log = require('../libraries/log');

const options = config.get('database');

options.logging = process.env.NODE_ENV === 'test' ? false : log.db.debug;

const sequelize = new Sequelize(options.database, options.username, options.password, options);

const db = module.exports = {};

fs.readdirSync(__dirname)
  .filter((filename) => filename !== 'index.js' && filename.substr(-3) === '.js')
  .forEach((filename) => {
    const model = sequelize.import(path.join(__dirname, filename));

    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (modelName.substr(0, 1) !== '_' && 'associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});


db.Sequelize = Sequelize;
db.sequelize = sequelize;
