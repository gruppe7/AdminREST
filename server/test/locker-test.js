var should = require('should');
var assert = require('assert');
var request = require('supertest');

//var winston = require('winston');
var config = require('../config-release.js');

describe('Routing', function() {
  var url = 'http://localhost:8443';

  describe('Lockers', function() {
    it('should return all lockers when providing unused semester', function(done) {
    request(url)
	.get('/lockers/2014v')
    // end handles the response
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.property('status',200);
          done();
        });
    });
  });
});
