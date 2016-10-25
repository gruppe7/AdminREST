var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var EventHandler = function() {
  this.events=handleEventsRequest;

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





module.exports = EventHandler;
