'use strict';

const common = require('../common');

describe('Device', () => {
  it('PUT /devices/:id should edit the device', (done) => {
    common.request(common.server)
      .put(`/devices/${common.device.id}`)
      .send({
        locationId: common.location.id,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('id').and.equal(common.device.id);
        common.expect(res.body).to.have.property('location')
          .and.have.property('id')
          .and.equal(common.location.id);

        common.device = res.body;

        done();
      });
  });

  it('GET /location/:id/videos?scope=home should get the home videos of the location', (done) => {
    common.request(common.server)
      .get(`/locations/${common.location.id}/videos?scope=home`)
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
});
