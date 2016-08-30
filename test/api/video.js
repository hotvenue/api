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
      .field('user[email]', common.email)
      .field('device[identifierForVendor]', common.deviceId)
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

        common.expect(res.body).to.have.property('user');
        common.expect(res.body.user).to.be.a('object');
        common.expect(res.body.user).to.have.property('id').and.equal(common.user.id);
        common.expect(res.body.user).to.have.property('email').and.equal(common.email);

        common.expect(res.body).to.have.property('device');
        common.expect(res.body.device).to.be.a('object');
        common.expect(res.body.device).to.have.property('identifierForVendor')
          .and.equal(common.deviceId);

        common.video = res.body;

        const videoPath = path.join(config.get('folder').upload,
          common.video.id + common.video.extension);

        setTimeout(() => {
          const videoStat = fs.statSync(videoPath);

          common.expect(videoStat.isFile()).to.equal(true);

          fs.unlinkSync(videoPath);

          done();
        }, 1000);
      });
  });

  it('POST /video should refuse without user', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-video.mp4')
      .field('device[identifierForVendor]', common.deviceId)
      .expect(500)
      .end(done);
  });

  it('POST /video should refuse without device', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-video.mp4')
      .field('user[email]', common.email)
      .expect(500)
      .end(done);
  });

  it('POST /video should refuse to upload the image', (done) => {
    common.request(common.server)
      .post('/video')
      .attach('video', 'test/assets/sample-image.jpg')
      .field('user[email]', common.email)
      .field('device[identifierForVendor]', common.deviceId)
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

  it('PUT /video/:id should return an error', (done) => {
    common.request(common.server)
      .put(`/user/${common.video.id}`)
      .expect(404)
      .end(done);
  });

  it('DELETE /video/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/user/${common.video.id}`)
      .expect(404)
      .end(done);
  });
});
