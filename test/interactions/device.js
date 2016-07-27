'use strict';

const common = require('../common');

describe('Device', () => {
  it('PUT /device/:id should edit the device', (done) => {
    common.request(common.server)
      .put(`/device/${common.device.id}`)
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
});
