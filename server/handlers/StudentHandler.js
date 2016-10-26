var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var StudentHandler = function() {
  this.new=newStudentRequest;
  this.verify=verifyStudentRequest;
};


function newStudentRequest(req, res){
  var username=req.body.username || null;
  var firstname=req.body.firstname || null;
  var lastname=req.body.lastname || null;

  if(username==null || firstname==null || lastname==null){
    res.json(400, 'username, firstname or lastname not submitted');
    return;
  }

  var sql = "select * from Students where Students.username=?";
  var inserts = [username];
  sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          if(rows.length==0){

            var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var token = '';
            for (var i = 0; i <= 16; i++) {
              token += chars[Math.round(Math.random() * (chars.length - 1))];
            }

            console.log(token);

            sql="insert into Students (username, firstname, lastname, verifyingCode) values (?,?,?,?)";
            inserts=[username, firstname, lastname, token];
            sql=mysql.format(sql, inserts);
            console.log(sql);
            connection.query(sql).then(
              function (rows){
                res.json(201, {username, firstname, lastname, token});
              },
              function(err){
                res.json(500, {error:'something went wrong while getting db connection'});
              }
            )
          }else{
            res.json(400, {error:'student is already registered'});
          }
        },
        function (err){
          res.json(500, {error:'something went wrong while getting db connection'});
        }
      );
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );
}
function verifyStudentRequest(req, res){
  var username = req.params.username || null;
  var token = req.query.username || null;

  if(username==null || token==null){
    res.json(400, {error:'username or token missing'});
    return;
  }

  var sql="select * from Students where username=? and verified=0";
  var inserts=[username];
  sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          if(rows.length==0){
            res.json(400, {error:'username wrong or student already verified'});
          }else{
            //student not verified, checking token
            if(rows[0].token.equals(token)){
              //token ok, verifying
              sql="update Students set verified=1 where username=?"
              inserts=[username];
              sql=mysql.format(sql, inserts);
              connection.query(sql).then(
                function (rows){
                  res.json(201, {success:'student verified'});
                },
                function(err){
                  res.json(500, {error:'something went wrong while getting db connection'});
                }
              )
            }else{
              res.json(400, {error:'token wrong'});
            }

          }
        },
        function (err){
          res.json(500, {error:'something went wrong while getting db connection'});
        }
      );
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );

}






module.exports = StudentHandler;
