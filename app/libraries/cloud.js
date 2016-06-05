'use strict';

const fs = require('fs');
const config = require('config');
const awsConfig = config.get('aws');

process.env.AWS_ACCESS_KEY_ID = awsConfig.iam.webserver.key;
process.env.AWS_SECRET_ACCESS_KEY = awsConfig.iam.webserver.secret;

const aws = require('aws-sdk');

const s3 = new aws.S3({
  params: {
    Bucket: awsConfig.s3.bucket,
  },
  signatureVersion: 'v4',
});

module.exports = {
  upload(source, destination, done) {
    let body;

    if (typeof source === 'string') {
      body = fs.createReadStream(source);
    }

    s3
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
