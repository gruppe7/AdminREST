var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var EventHandler = function() {
  this.events=handleEventsRequest;
  this.attend=handleAttendingRequest;
};


function handleEventsRequest(req, res){

  var sql = "SELECT Events.*, count(EventParticipation.username) as attending FROM Events left join EventParticipation on Events.eventId=EventParticipation.eventId group by Events.eventId";
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

function handleAttendingRequest(req, res){
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



module.exports = EventHandler;
