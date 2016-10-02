'use strict';

const _ = require('lodash');
const packageObj = require('../../package.json');

module.exports = {
  home(req, res) {
    res.json(_.pick(packageObj, [
      'name',
      'version',
      'deploy',
    ]));
  },
};
