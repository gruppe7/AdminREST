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
    /*it('should correctly update an existing account', function(done){
	var body = {
		firstName: 'JP',
		lastName: 'Berd'
	};
	request(url)
		.put('/api/profiles/vgheri')
		.send(body)
		.expect('Content-Type', /json/)
		.expect(200) //Status code
		.end(function(err,res) {
			if (err) {
				throw err;
			}
			// Should.js fluent syntax applied
			res.body.should.have.property('_id');
	                res.body.firstName.should.equal('JP');
	                res.body.lastName.should.equal('Berd');
	                res.body.creationDate.should.not.equal(null);
			done();
		});
	});*/
  });
});
