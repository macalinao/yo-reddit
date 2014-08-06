/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var _ = require('lodash');
var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var Subscriber = mongoose.model('Subscriber', new mongoose.Schema({
  yo: {
    type: String,
    unique: true
  },
  following: [String],
  lastUpdate: Date
}));

// Setup server
var app = express();
var server = require('http').createServer(app);

require('./config/express')(app);
require('./routes')(app);

// Yo stuff
var yo = (function() {
  var Yo = require('yo-api');
  return new Yo(process.env.YO_API_TOKEN);
})();

function isTwitterUpdated(user) {

}

function handleSubscriber(doc, next) {
  async.detect(doc.following, function(twitterName, cb) {
    isTwitterUpdated(twitterName, cb);
  }, function(result) {
    yo.yo(doc.yo, function(err, head, body) {
      next();
    });
  });
};

setInterval(function() {
  Subscriber.find().exec(function(err, docs) {
    async.each(docs, function(doc, next) {
      handleSubscriber(doc, next);
    }, function(err) {
      if (err) {
        console.log(err);
      }
      console.log('Updated ' + docs.length + ' subscribers.');
    });
  });
}, 60000);

// Start server
server.listen(config.port, config.ip, function() {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
