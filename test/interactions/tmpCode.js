'use strict';

const common = require('../common');

describe('TmpCode in User and Video', () => {
  it('POST /tmpCode should create a code', (done) => {
    common.request(common.server)
      .put(`/user/${common.user.id}`)
      .send({
        tmpCode: common.tmpCode.id,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body.tmpCodes).to.be.a('array').and.have.length(1);
        common.expect(res.body.tmpCodes[0].video).to.be.a('null');

        done();
      });
  });
});
