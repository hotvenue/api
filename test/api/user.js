'use strict';

const common = require('../common');

it('should return an empty list', function (done) {
  common.request(common.server)
    .get('/user')
    .expect(200)
    .expect([])
    .end(done);
});