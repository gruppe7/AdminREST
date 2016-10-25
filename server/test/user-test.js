var should = require('should');
var assert = require('assert');
var request = require('supertest');

//var winston = require('winston');
var config = require('../config-release.js');

describe('Routing', function() {
  var url = 'http://localhost:8443';

  describe('User', function() {
    it('should return error trying to login wrong username and password', function(done) {
      var login = {
        username: 'gunnadal',
        password: 'abc1234'
      };
    request(url)
	.post('/users/')
	.send(login)
    // end handles the response
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.property('status',400);
          done();
        });
    });
    it('should return return privilegies and access token when using correct username and password', function(done) {
      var login = {
        username: 'gunnadal',
        password: 'abc123'
      };
    request(url)
	.post('/users/')
	.send(login)
    // end handles the response
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          res.should.have.property('status',201);
          res.body.eventmanager.should.equal(1);
          res.body.employee.should.equal(1);
          res.body.token.should.not.equal(null);
          done();
        });
    });
  });
});
