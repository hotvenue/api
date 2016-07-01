'use strict';

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const assert = require('assert');
const supertest = require('supertest');

function importTests(name) {
  describe(name, () => {
    fs.readdirSync(path.join(__dirname, name))
        .filter((filename) => filename.substr(-3) === '.js')
        .forEach((filename) => {
          const filepath = path.join(__dirname, name, filename);

          require(filepath); // eslint-disable-line global-require
        });
  });
}

function importTestSuite() {
  fs.readdirSync(__dirname)
      .filter((filename) => filename.substr(0, 1) !== '.' && filename.substr(-3) !== '.js')
      .forEach((dirname) => {
        importTests(dirname);
      });
}

module.exports = {
  expect: chai.expect,
  assert,
  server: null,
  request: supertest,
  importTests,
  importTestSuite,
  email: 'hello@its.me',
};
