'use strict';

const common = require('../common');

describe('User', () => {
  it('GET /user should return an empty list', (done) => {
    common.request(common.server)
      .get('/user')
      .expect(200)
      .expect([])
      .end(done);
  });

  it('POST /user should add a user', (done) => {
    common.request(common.server)
      .post('/user')
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

  it('POST /user should not add the same user', (done) => {
    common.request(common.server)
      .post('/user')
      .send({
        email: common.email,
      })
      .expect(400)
      .end(done);
  });

  it('GET /user/:id should return the previously created user', (done) => {
    common.request(common.server)
      .get(`/user/${common.user.id}`)
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

  it('PUT /user/:id should edit the user', (done) => {
    const email = 'hello@gmail.com';

    common.request(common.server)
      .put(`/user/${common.user.id}`)
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

  it('DELETE /user/:id should return an error', (done) => {
    common.request(common.server)
      .delete(`/user/${common.user.id}`)
      .expect(404)
      .end(done);
  });
});
