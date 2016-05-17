'use strict';

const common = require('../common');

describe('TmpCode', () => {
  it('POST /tmpCode should create a code', (done) => {
    common.request(common.server)
      .post('/tmpCode')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('id');

        done();
      });
  });
});
