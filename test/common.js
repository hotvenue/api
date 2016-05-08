'use strict';

const fs = require('fs');
const path = require('path');
const chai = require('chai');
const assert = require('assert');
const supertest = require('supertest');

module.exports = {
  chai: chai.expect,
  assert: assert,
  server: null,
  request: supertest,
  importTests: importTests,
  importTestSuite: importTestSuite
};

function importTests (name) {
  describe(name, function () {
    fs.readdirSync(path.join(__dirname, name))
      .filter(function (filename) {
        return filename.substr(-3) === '.js';
      })
      .forEach(function (filename) {
        const filepath = path.join(__dirname, name, filename);

        require(filepath);
      });
  });
}

function importTestSuite () {
  fs.readdirSync(__dirname)
    .filter(function (filename) {
      return filename.substr(0, 1) !== '.' && filename.substr(-3) !== '.js';
    })
    .forEach(function (dirname) {
      importTests(dirname);
    });
}