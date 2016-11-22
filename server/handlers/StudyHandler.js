var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var StudyHandler = function() {
  this.studies=handleStudiesRequest;
};


function handleStudiesRequest(req, res){

  var sql = "select * from Studies";
  //var inserts = [semester];
  //sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          console.log(rows);
          res.json(200, rows);
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



module.exports = StudyHandler;
