'use strict';

const http = require('http');

exports.handler = (event, context, done) => {
  const req = http.request({
    host: 'api.hotvenueapp.com',
    path: '/v1/job?secret=hgvysjrv7kpp06zfu10c',
    method: 'POST',
  }, (res) => {
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      console.log(`Response: ${chunk}`);
    });

    res.on('end', () => {
      console.log('No more data in response.');
      done();
    });
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  req.write('');
  req.end();
};
