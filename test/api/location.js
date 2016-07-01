'use strict';

const fs = require('fs');
const path = require('path');
const config = require('config');

const common = require('../common');

describe('Location', () => {
  it('GET /location should return an empty list', (done) => {
    common.request(common.server)
      .get('/location')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /location should add a location', (done) => {
    const locationName = 'location 1';
    const geoLatitude = 45.4500796;
    const geoLongitude = 9.1707642;

    common.request(common.server)
      .post('/location')
      .attach('image', 'test/assets/sample-image.jpg')
      .field('name', locationName)
      .field('geoLatitude', geoLatitude)
      .field('geoLongitude', geoLongitude)
      // .expect(201)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('name').and.equal(locationName);
        common.expect(res.body).to.have.property('geoLatitude').and.equal(geoLatitude);
        common.expect(res.body).to.have.property('geoLongitude').and.equal(geoLongitude);
        common.expect(res.body).to.have.property('id').and.equal(1);
        common.expect(res.body).to.have.property('createdAt')
            .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);
        common.expect(res.body).to.have.property('updatedAt')
            .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);

        common.location = res.body;

        const imagePath = path.join(config.get('folder').upload,
          common.location.id + common.location.extension);

        const imageStat = fs.statSync(imagePath);

        common.expect(imageStat.isFile()).to.equal(true);

        fs.unlinkSync(imagePath);

        done();
      });
  });

  it('GET /location/:id should return the previously created location', (done) => {
    common.request(common.server)
      .get(`/location/${common.location.id}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object').and.deep.equal(common.location);

        done();
      });
  });

  it('PUT /location/:id should edit the location', (done) => {
    const locationName = 'location new name';

    common.request(common.server)
      .put(`/location/${common.location.id}`)
      .send({
        name: locationName,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('name').and.equal(locationName);

        common.location.name = locationName;

        done();
      });
  });

  it('DELETE /location/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/location/${common.location.id}`)
      .expect(404)
      .end(done);
  });
});
