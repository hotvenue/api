'use strict';

const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

const log = require('../../libraries/log');

module.exports = {
  params(req, res) {
    const privacyText = md.render(
      fs.readFileSync(
        path.join(__dirname, '..', '..', 'docs', 'privacy.md'), {
          encoding: 'utf8',
        }
      )
    );
    const privacy = `
<html>
  <head>
    <title>Privacy Policy</title>
  </head>
  <body>
  
${privacyText}

  </body>
</html>
`;

    res.json({
      privacy,
      /*
      checkbox: [{
        required: true,
        name: 'privacy-single',
        text: 'Checkbox number 1',
      }, {
        required: false,
        name: 'privacy-multiple',
        text: 'Checkbox number 2',
      }],
      */
      checkbox: [],
    });
  },

  log(req, res) {
    let severity = req.params.severity || 'info';

    if (Object.keys(log.splunk.levels).indexOf(severity) === -1) {
      severity = 'info';
    }

    log.splunk[severity](req.body);

    res.json({
      severity,
      log: req.body,
    });
  },
};
