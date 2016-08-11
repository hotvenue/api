'use strict';

const fs = require('fs');
const config = require('config');
const awsConfig = config.get('aws');

const log = require('./log');

let iam = 'webserver';
if (process.env.NODE_ENV === 'test' || process.env.SPOTVENUE_SERVER === 'appserver') {
  iam = 'appserver';
}

process.env.AWS_ACCESS_KEY_ID = awsConfig.iam[iam].key;
process.env.AWS_SECRET_ACCESS_KEY = awsConfig.iam[iam].secret;

const aws = require('aws-sdk');

const cloud = module.exports = {
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,

  s3: new aws.S3({
    params: {
      Bucket: awsConfig.s3.bucket,
    },
    signatureVersion: 'v4',
  }),
  ses: new aws.SES({
    region: awsConfig.ses.region,
  }),

  upload(source, destination, done) {
    let body;

    if (typeof source === 'string') {
      body = fs.createReadStream(source);
    }

    cloud.s3
      .upload({
        Body: body,
        Key: destination,
      })
      .send(done);
  },

  download(source, destination, done) {
    if (typeof destination === 'function') {
      done = destination; // eslint-disable-line no-param-reassign
      destination = null; // eslint-disable-line no-param-reassign
    }

    cloud.s3
      .getObject({
        Key: source,
      }, (err, data) => {
        if (err) {
          log.aws.debug('Error while downloading a file from S3');
          log.aws.error(err);

          done(err);
          return;
        }

        if (destination) {
          fs.writeFileSync(destination, data.Body);
        }

        done();
      });
  },
};
