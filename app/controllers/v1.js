'use strict';

const fs = require('fs');
const path = require('path');
const uuid = require('node-uuid');
const config = require('config');
const archiver = require('archiver');
const md = require('markdown-it')();

const log = require('../libraries/log');
const cloud = require('../libraries/cloud');
const jobs = require('../jobs');
const models = require('../models');

const configApp = config.get('app');
const configAws = config.get('aws');
const configJobs = config.get('jobs');
const configFolder = config.get('folder');

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

  config(req, res) {
    res.json({
      app: configApp,
      aws: configAws.s3,
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

  zip(req, res) {
    const locationId = req.params.locationId;

    if (!locationId) {
      res.status(412);
      return res.json({
        error: 'Please specify a location id',
      });
    }

    return models.location
      .findById(locationId, {
        include: [
          { model: models.video },
        ],
      })
      .then((location) => {
        if (!location) {
          res.status(404);
          return res.json({
            error: 'Location not found',
          });
        }

        if (location.videos && location.videos.length === 0) {
          return res.json({
            message: 'No video for this location',
          });
        }

        const zipPath = path.join(configFolder.tmp, `${uuid.v4()}.zip`);
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip');

        output.on('close', () => {
          res.sendFile(zipPath);
        });

        archive.on('error', (err) => {
          throw err;
        });

        archive.pipe(output);

        return Promise.all(location.videos.map((video) => cloud.download(video.urlEditedARelative)
            .then((stream) => archive.append(stream, { name: video.name }))))
          .then(() => archive.finalize());
      });
  },

  ec2List(req, res) {
    cloud.ec2.describeInstances({}, (err, data) => {
      if (err) {
        throw new Error(err);
      }

      res.json(data);
    });
  },

  ec2Launch(req, res) {
    cloud.ec2.runInstances({
      ImageId: 'ami-6f587e1c',
      MinCount: 1,
      MaxCount: 1,
      InstanceType: 't2.micro',
    }, (err, data) => {
      if (err) {
        throw new Error(err);
      }

      res.json(data);
    });
  },
};
