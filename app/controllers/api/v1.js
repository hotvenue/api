'use strict';

const fs = require('fs');
const path = require('path');
const md = require('markdown-it')();

module.exports = {
  params(req, res) {
    const privacyText = md.render(
      fs.readFileSync(
        path.join(__dirname, '..', '..', 'docs', 'privacy.MD'), {
          encoding: 'utf8',
        }
      )
    );
    const privacy = `
<html>
  <head>
    <title>Privacy Policy</title>
  </head>
  <body>
  
${privacyText}

  </body>
</html>
`;

    res.json({
      privacy,
    });
  },
};
