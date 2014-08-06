/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

var yo = (function() {
  var Yo = require('yo-api');
  return new Yo(process.env.YO_API_TOKEN);
})();

module.exports = function(app) {
  app.route('/register')
    .post(function(req, res) {
      var yoName = req.body.yoName;
      var twitterName = req.body.twitterName;

      console.log('yoing...');
      yo.yo(yoName, function(err, head, body) {
        if (head.statusCode === 201) {
          res.send('OK');
        } else {
          res.status(400).send('NOT OK');
        }
      });
    });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
