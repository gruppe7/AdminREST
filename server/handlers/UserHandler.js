var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');
var jwt = require('jsonwebtoken');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var UserHandler = function() {
  this.login=handleLoginRequest;
  this.token=verifyTokenRequest;
};


function handleLoginRequest(req, res){
  var username=req.body.username || null;
  var password=req.body.password || null;

  if(username==null || password==null){
    res.json(400, 'password or username not submitted');
    return;
  }

  var sql = "select * from Users where Users.username=?";
  var inserts = [username];
  sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          if(rows.length==1){
            if(bcrypt.compareSync(password, rows[0].password)){
              var employee=rows[0].employee;
              var eventmanager=rows[0].eventmanager;
              var token = jwt.sign({employee, eventmanager}, config.secret);
              console.log({employee, eventmanager, token});
              res.json(200, {employee, eventmanager, token});
              connection.destroy();
              return;
            }
          }
          res.json(400, {error:'user does not exist or password is wrong'});
          connection.destroy();
          return;
        },
        function (err){
          res.json(500, {error:'something went wrong while getting student from database'});
          connection.destroy();
          return;
        }
      )
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );
}


function verifyTokenRequest(req, res, next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return res.json(400,{ error: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.json(400,{error: 'No token provided.'});

  }
}



module.exports = UserHandler;
