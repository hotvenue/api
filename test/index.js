'use strict';

const fs = require('fs');
const config = require('config');

const common = require('./common');

describe('Test HotVenue', () => {
  before((done) => {
    fs.unlink(config.get('database').storage, done);
  });

  before((done) => {
    common.server = require('../bin/www'); // eslint-disable-line global-require
    common.server.on('listening', done);
  });

  common.importTestSuite();
});
