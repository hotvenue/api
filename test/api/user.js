'use strict';

const common = require('../common');

describe('User', function () {
  var user = {};

  it('GET /user should return an empty list', function (done) {
    common.request(common.server)
      .get('/user')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /user should add a user', function (done) {
    const email = 'hello@its.me';

    common.request(common.server)
      .post('/user')
      .send({
        email: email
      })
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        }
        
        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('email').and.equal(email);
        common.expect(res.body).to.have.property('userId').and.equal(1);
        common.expect(res.body).to.have.property('createdAt').and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);
        common.expect(res.body).to.have.property('updatedAt').and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);

        user = res.body;
        user.Videos = [];

        done();
      });
  });

  it('GET /user/:id should return the previously created user', function (done) {
    common.request(common.server)
      .get(`/user/${user.userId}`)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        common.expect(res.body).to.be.a('object').and.deep.equal(user);

        done();
      });
  });

  it('PUT /user/:id should edit the user', function (done) {
    const email = 'hello@gmail.com';

    common.request(common.server)
      .put(`/user/${user.userId}`)
      .send({
        email: email
      })
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('email').and.equal(email);

        done();
      });
  });
});
