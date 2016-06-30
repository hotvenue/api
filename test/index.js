'use strict';

const fs = require('fs');
const config = require('config');

const common = require('./common');

describe('Test HotVenue', () => {
  before((done) => {
    try {
      fs.unlinkSync(config.get('database').storage);
    } catch (e) {
      if (e.code !== 'ENOENT') {
        done(e);
        return;
      }
    }

    done();
  });

  before((done) => {
    common.server = require('../bin/www'); // eslint-disable-line global-require
    common.server.on('listening', done);
  });

  common.importTestSuite();
});
