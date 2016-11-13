'use strict';

const common = require('../common');

describe('Device', () => {
  it('GET /devices should return an empty list', (done) => {
    common.request(common.server)
      .get('/devices')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /devices should add a device', (done) => {
    common.request(common.server)
      .post('/devices')
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

  it('GET /devices/:id should return the previously created device', (done) => {
    common.request(common.server)
      .get(`/devices/${common.device.id}`)
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

  it('DELETE /devices/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/devices/${common.device.id}`)
      .expect(404)
      .end(done);
  });
});
