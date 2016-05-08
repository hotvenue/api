'use strict';

const path = require('path');

const config = require('./default');

const dataFolder = path.join(__dirname, '..', 'data');

module.exports = {
  database: {
    dialect: 'sqlite',
    storage: config.data.sqlite
  }
};