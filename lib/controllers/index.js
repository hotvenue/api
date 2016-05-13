const packageObj = require('../../package.json');

module.exports = {
  home(req, res) {
    res.json(packageObj);
  },
};
