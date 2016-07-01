'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');

const common = require('../common');

describe('Video', () => {
  it('POST /video should upload the video', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-video.mp4')
      .expect(201)
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

        const videoPath = path.join(config.get('folder').upload,
          common.video.id + common.video.extension);

        const videoStat = fs.statSync(videoPath);

        common.expect(videoStat.isFile()).to.equal(true);

        fs.unlinkSync(videoPath);

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

  it('GET /video should get the list of videos (max: 10)', (done) => {
    common.request(common.server)
      .get('/video')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('array').and.have.length(1);

        done();
      });
  });

  it('GET /video?offset=1 should get no videos', (done) => {
    common.request(common.server)
      .get('/video?offset=1')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /video with a user should also create the user', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-video.mp4')
      .field('user[email]', common.email)
      .expect(201)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('id');
        common.expect(res.body).to.have.property('user');
        common.expect(res.body.user).to.be.a('object');
        common.expect(res.body.user).to.have.property('id').and.equal(common.userId);
        common.expect(res.body.user).to.have.property('email').and.equal(common.email);

        done();
      });
  });

  it('DELETE /video/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/user/${common.video.id}`)
      .expect(404)
      .end(done);
  });
});
