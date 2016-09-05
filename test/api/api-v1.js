'use strict';

const common = require('../common');

const log = { foo: 'bar' };

describe('API v1', () => {
  it('GET /params should return the params', (done) => {
    common.request(common.server)
      .get('/v1/params')
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('privacy');

        done();
      });
  });

  it('POST /log should return the body', (done) => {
    common.request(common.server)
      .post('/v1/log')
      .send(log)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('severity').and.equal('info');
        common.expect(res.body).to.have.property('log').and.deep.equal(log);

        done();
      });
  });

  it('POST /log/:severity should return the body and change the severity', (done) => {
    const severity = 'warn';

    common.request(common.server)
      .post(`/v1/log/${severity}`)
      .send(log)
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('severity').and.equal(severity);
        common.expect(res.body).to.have.property('log').and.deep.equal(log);

        done();
      });
  });
});
