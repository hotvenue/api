'use strict';

const fs = require('fs');
const config = require('config');
const elasticsearch = require('elasticsearch');

const awsConfig = config.get('aws');
const esClient = elasticsearch.Client;

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

  es: esClient({
    hosts: awsConfig.es.endpoint,
    connectionClass: require('http-aws-es'), // eslint-disable-line global-require
    amazonES: {
      region: awsConfig.es.region,
      credentials: new aws.EnvironmentCredentials('AWS'),
    },
  }),
  s3: new aws.S3({
    params: {
      Bucket: awsConfig.s3.bucket,
      region: awsConfig.s3.region,
    },
    signatureVersion: 'v4',
  }),
  ses: new aws.SES({
    region: awsConfig.ses.region,
  }),

  /**
   *
   * @param {string} source
   * @param {string} destination
   * @return {Promise}
   */
  upload(source, destination) {
    let body = source;

    if (typeof body === 'string') {
      body = fs.readFileSync(source);
    }

    return cloud.s3
      .putObject({
        Body: body,
        Key: destination,
      })
      .promise();
  },

  /**
   *
   * @param {string} source
   * @param {string?} destination
   * @return {Promise}
   */
  download(source, destination) {
    return cloud.s3
      .getObject({
        Key: source,
      })
      .promise()
      .then((data) => {
        if (destination) {
          fs.writeFileSync(destination, data.Body);
        }

        return data.Body;
      });
  },

  copy(source, destination) {
    source = `${awsConfig.s3.bucket}/${source}`; // eslint-disable-line no-param-reassign

    return cloud.s3
      .copyObject({
        Key: destination,
        CopySource: source,
      })
      .promise();
  },
};
