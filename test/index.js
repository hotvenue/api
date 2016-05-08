'use strict';

const fs = require('fs');
const config = require('config');

const common = require('./common');

describe('Test HotVenue', function () {
  before(function (done) {
    const server = common.server = require('../bin/www');

    server.on('listening', done);
  });

  after(function (done) {
    common.server.close(function () {
      fs.unlink(config.get('database').storage, done);
    });
  });

  common.importTestSuite();
});
