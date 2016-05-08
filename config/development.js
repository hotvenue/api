'use strict';

const path = require('path');

const dataFolder = path.join(__dirname, '..', 'data');

module.exports = {
  database: {
    dialect: 'sqlite',
    storage: path.join(dataFolder, 'hotvenue.db')
  }
};