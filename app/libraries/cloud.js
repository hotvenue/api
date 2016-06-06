'use strict';

const fs = require('fs');
const config = require('config');
const awsConfig = config.get('aws');

let iam = 'webserver';
if (process.env.NODE_ENV === 'test' || process.env.SPOTVENUE_SERVER === 'application') {
  iam = 'appserver';
}

process.env.AWS_ACCESS_KEY_ID = awsConfig.iam[iam].key;
process.env.AWS_SECRET_ACCESS_KEY = awsConfig.iam[iam].secret;

const aws = require('aws-sdk');

const cloud = module.exports = {
  key: process.env.AWS_ACCESS_KEY_ID,
  secret: process.env.AWS_SECRET_ACCESS_KEY,

  ses: new aws.SES({
    region: awsConfig.ses.region,
  }),
  s3: new aws.S3({
    params: {
      Bucket: awsConfig.s3.bucket,
    },
    signatureVersion: 'v4',
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
      // .on('httpUploadProgress', (evt) => {
      //   console.log(evt);
      // })
      .send(done);
  },
};
