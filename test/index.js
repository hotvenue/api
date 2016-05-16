'use strict';

const fs = require('fs');
const config = require('config');

const common = require('./common');
const server = require('../bin/www');

describe('Test HotVenue', () => {
  before((done) => {
    common.server = server;

    server.on('listening', done);
  });

  after((done) => {
    common.server.close(() => {
      fs.unlink(config.get('database').storage, done);
    });
  });

  common.importTestSuite();
});
