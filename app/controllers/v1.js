'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');
const md = require('markdown-it')();

const log = require('../libraries/log');
const jobs = require('../jobs');

const configJobs = config.get('jobs');

module.exports = {
  params(req, res) {
    const privacyText = md.render(
      fs.readFileSync(
        path.join(__dirname, '..', 'docs', 'privacy.md'), {
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

    if (Object.keys(log.analyticsFrame.levels).indexOf(severity) === -1) {
      severity = 'info';
    }

    log.analyticsFrame[severity](req.body);

    res.json({
      severity,
      log: req.body,
    });
  },

  job(req, res) {
    const job = req.params.job || 'maid';

    if (req.query.secret === configJobs.secret) {
      if (jobs.hasOwnProperty(job)) {
        jobs[job](res.body);

        return res.json({ result: true });
      }

      res.status(404);
      return res.json({
        error: 'Job not found',
      });
    }

    res.status(403);
    return res.json({
      error: 'You are not allowed to access this page',
    });
  },
};
