var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var EventHandler = function() {
  this.events=handleEventsRequest;
  this.event=handleEventRequest;

};


function handleEventsRequest(req, res){
  var sql = "SELECT Events.*, count(EventParticipation.username) as attending FROM Events left join EventParticipation on Events.eventId=EventParticipation.eventId group by Events.eventId";
  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          res.json(200, rows);
          connection.destroy();
          return;
        },
        function (err){
          res.json(500, {error:'something went wrong while getting events'});
          connection.destroy();
        }
      )
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );
}
function handleEventRequest(req, res){
    if(req.decoded.eventmanager==0){
      res.json(400, {error:'No access'});
      return;
    }

    var eventId=req.params.eventId || null;

    if(eventId==null){
      res.json(400, {error:'No eventId provided'});
      return;
    }

    var sql = "SELECT Events.*, EventParticipation.* FROM Events left join EventParticipation on Events.eventId=EventParticipation.eventId where Events.eventId=?";
    var inserts=[eventId];
    sql=mysql.format(sql, inserts);

    pool.getConnection().then(
      function (connection){
        connection.query(sql).then(
          function (rows){
            if(rows.length!=0){

              var event= {eventId:rows[0].eventId, name:rows[0].name, description:rows[0].description, date:rows[0].date, participants:rows[0].participants, dinnerParticipants:rows[0].dinnerParticipants};


              var participants=[];
              if(rows[0].username==null){
                participants=null;
              }else{
                for(var i=0;i<rows.length;i++){
                  participants[i]={username:rows[i].username, eventParticipationId:rows[i].eventParticipationId, dinnerParticipation:rows[i].dinnerParticipation, participated:rows[i].participated};
                }
              }

              res.json(200, {event, participants});
              connection.destroy();
              return;

            }else{
              res.json(400, {error:'Event does not exist'});
              connection.destroy();
              return;
            }

          },
          function (err){
            res.json(500, {error:'something went wrong while getting event'});
            connection.destroy();
          }
        )
      },
      function (err){
        res.json(500, {error:'could not connect to database'});
      }
    );
}

function createEventRequest(req, res){
    if(req.decoded.eventmanager==0){
      res.json(400, {error:'No access'});
      return;
    }

    var name=req.body.eventId || null;
    var description=req.body.description||null;
    var date=req.body.date||null;
    var participants=req.body.participants||null;
    var dinnerParticipants=req.body.dinnerParticipants||null;

    if(name==null||description==null||date==null||participants==null||dinnerParticipants==null){
      res.json(400, {error:'Name, description, date, participants or dinner participants not provided.'});
      return;
    }
    if(isNaN(participants)||isNaN(dinnerParticipants)){
      res.json(400, {error:'Participants and dinner participants need to be formatted as numbers'});
      return;
    }
    if(dinnerParticipants>participants){
      res.json(400, {error:'Cannot have more participants on dinner than event.'});
      return;
    }

    var sql = "insert into Events (name, description, date, participants, dinnerParticipants) values (?,?,?,?,?)";

    var inserts=[name, description, date, participants, dinnerParticipants];
    sql=mysql.format(sql, inserts);

    pool.getConnection().then(
      function (connection){
        connection.query(sql).then(
          function (rows){

            res.json(200, {rows});
            connection.destroy();
            return;

          },
          function (err){
            res.json(500, {error:'something went wrong while creating event'});
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





module.exports = EventHandler;
