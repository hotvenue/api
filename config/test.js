'use strict';

const path = require('path');

const config = require('./default');

module.exports = {
  database: {
    dialect: 'sqlite',
    storage: path.join(config.folder.data, 'test.db'),
  },
};
