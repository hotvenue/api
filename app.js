'use strict';

process.env.SPOTVENUE_SERVER = 'appserver';

const email = require('./app/libraries/email');

email
  .send({
    to: 'niccolo@olivieriachille.com',
    from: 'Samantha <samantha@spotvenue.tk>',
    subject: 'Ehi, come va?',
    text: 'Questa è una mail di prova, vediamo se arriva...',
  })
  .then((err, info) => {
    if (err) {
      console.error(err);
    }

    console.log(info);
  })
  .catch((err) => {
    console.error(err);
  });
