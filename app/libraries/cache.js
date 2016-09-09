'use strict';

const redis = require('redis');
const config = require('config');

const configRedis = config.get('redis');

const client = redis.createClient(configRedis);

module.exports = client;
