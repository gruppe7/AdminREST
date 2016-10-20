var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var LockerHandler = function() {
  this.lockers=handleLockersRequest;
};


function handleLockersRequest(req, res){
  var semester=req.params.semester || null;

  if(semester==null ){
    res.json(400, 'semester not submitted');
    return;
  }

  var sql = "SELECT Lockers.lockerId, Lockers.floor FROM Lockers WHERE Lockers.lockerId NOT IN (SELECT LockerRent.lockerId FROM LockerRent where LockerRent.semester=?)";
  var inserts = [semester];
  sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          console.log(rows);
          res.json(201, rows);
          return;
        },
        function (err){
          res.json(500, {error:'something went wrong while getting db connection'});
        }
      )
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );
}
/*
// define the home page route
//log in user
app.get('/users/:username', (request, response)=>{
  //console.log(request.params.username + " " + request.query.password);
    login(request.params.username, request.query.password, function(result){
      response.send(result);
    });
});
*/


module.exports = LockerHandler;
