'use strict';

const common = require('../common');

describe('User', () => {
  it('GET /users should return an empty list', (done) => {
    common.request(common.server)
      .get('/users')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /users should add a user', (done) => {
    common.request(common.server)
      .post('/users')
      .send({
        email: common.email,
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('email').and.equal(common.email);
        common.expect(res.body).to.have.property('id').and.equal(1);
        common.expect(res.body).to.have.property('createdAt')
            .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);
        common.expect(res.body).to.have.property('updatedAt')
            .and.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{0,3}Z/);

        common.user = res.body;

        done();
      });
  });

  it('POST /users should not add the same user', (done) => {
    common.request(common.server)
      .post('/users')
      .send({
        email: common.email,
      })
      .expect(400)
      .end(done);
  });

  it('GET /users/:id should return the previously created user', (done) => {
    common.request(common.server)
      .get(`/users/${common.user.id}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object').and.deep.equal(common.user);

        done();
      });
  });

  it('PUT /users/:id should edit the user', (done) => {
    const email = 'hello@gmail.com';

    common.request(common.server)
      .put(`/users/${common.user.id}`)
      .send({
        email,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('email').and.equal(email);

        common.user.email = common.email = email;

        done();
      });
  });

  it('DELETE /users/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/users/${common.user.id}`)
      .expect(404)
      .end(done);
  });
});
