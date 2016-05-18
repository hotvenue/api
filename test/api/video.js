'use strict';

const common = require('../common');

describe('Video', () => {
  it('POST /video should upload the video', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-video.mp4')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('id');
        common.expect(res.body).to.have.property('extension').and.equal('.mp4');
        common.expect(res.body).to.have.property('createdAt')
          .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);
        common.expect(res.body).to.have.property('updatedAt')
          .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);

        common.video = res.body;

        done();
      });
  });

  it('POST /video should refuse to upload the image', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-image.jpg')
      .expect(409)
      .end(done);
  });
});
