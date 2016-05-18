'use strict';

const common = require('../common');

describe('TmpCode in User and Video', () => {
  it('PUT /user/:id { tmpCode } should associate a tmpCode to a user', (done) => {
    common.request(common.server)
      .put(`/user/${common.user.id}`)
      .send({
        tmpCode: common.tmpCode.id,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body.tmpCodes).to.be.a('array').and.have.length(1);
        common.expect(res.body.tmpCodes[0].video).to.be.a('null');

        done();
      });
  });

  it('PUT /video/:id { tmpCode } should associate a tmpCode to a video', (done) => {
    common.request(common.server)
      .put(`/video/${common.video.id}`)
      .send({
        tmpCode: common.tmpCode.id,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body.tmpCode).to.be.a('object');
        common.expect(res.body.tmpCode.video).not.to.be.a('null');

        done();
      });
  });
});
