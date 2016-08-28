'use strict';

const common = require('../common');

describe('Device', () => {
  it('GET /device should return an empty list', (done) => {
    common.request(common.server)
      .get('/device')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /device should add a device', (done) => {
    common.request(common.server)
      .post('/device')
      .send({
        identifierForVendor: common.deviceId,
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('identifierForVendor').and.equal(common.deviceId);
        common.expect(res.body).to.have.property('createdAt')
            .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);
        common.expect(res.body).to.have.property('updatedAt')
            .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);

        common.device = res.body;

        done();
      });
  });

  it('GET /device/:id should return the previously created device', (done) => {
    common.request(common.server)
      .get(`/device/${common.device.id}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object').and.deep.equal(common.device);

        done();
      });
  });

  it('DELETE /device/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/device/${common.device.id}`)
      .expect(404)
      .end(done);
  });
});
