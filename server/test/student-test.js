var should = require('should');
var assert = require('assert');
var request = require('supertest');

//var winston = require('winston');
var config = require('../config-release.js');

describe('Routing', function() {
  var url = 'http://localhost:8443';

  describe('Student', function() {
    it('should return error trying to create existing student', function(done) {
      var newstudent = {
        username: 'gunnadal',
        firstname: 'Gunnar',
        lastname: 'Dalen'
      };
    request(url)
	.post('/students/')
	.send(newstudent)
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.property('status',400);
          done();
        });
    });
    it('should return error trying to verify already verified student', function(done) {
    request(url)
	.get('/students/gunnadal?token=wrongtoken')
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.property('status',400);
          done();
        });
    });
  });
});
