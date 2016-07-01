'use strict';

const common = require('../common');

describe('API v1', () => {
  it('GET /params should return the params', (done) => {
    common.request(common.server)
      .get('/api/v1/params')
      // .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);

          return;
        }

        common.expect(res.body).to.be.a('object');
        common.expect(res.body).to.have.property('privacy');

        console.log(res.body.privacy);

        done();
      });
  });
});
