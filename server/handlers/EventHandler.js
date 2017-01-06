var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var EventHandler = function() {
  this.events=handleEventsRequest;
  this.event=handleEventRequest;
  this.newEvent=createEventRequest;
  this.joinEventLoggedIn=joinEventRequestLoggedIn;
  this.joinEvent=joinEventRequest;
  this.registerAttendance=registerAttendanceRequest;
  this.removeParticipantion=removeParticipantionRequest;

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

  var name=req.body.name || null;
  var description=req.body.description||null;
  var date=req.body.date||null;
  var participants=req.body.participants||null;
  var dinnerParticipants=req.body.dinnerParticipants;

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

          res.json(201, {success:'Event created'});
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

function joinEventRequestLoggedIn(req, res){
  if(req.decoded.eventmanager==0){
    res.json(400, {error:'No access'});
    return;
  }

  var eventId=req.params.eventId || null;
  var cardId=req.body.cardId||null;
  var username=req.body.username||null;
  var dinnerParticipation=req.body.dinnerParticipation||null;


  if(eventId==null||(cardId==null&&username==null)){
    res.json(400, {error:'EventId, username or cardId must be provided'});
    return;
  }
  if(isNaN(cardId)){
    res.json(400, {error:'CardId need to be formatted as number'});
    return;
  }



  var participants=0;
  var maxParticipants=0;

  var confirmedUsername;

  pool.getConnection().then(
    function (connection){

      var sql="select * from Students where username=? or studentCardId=?"
      var inserts=[username, cardId];
      sql=mysql.format(sql, inserts);

      connection.query(sql).then(
        function (rows){
          if(rows.length==1){
            confirmedUsername=rows[0].username;
          }else{
            res.json(400, {error:'Username or cardId wrong'});
            connection.destroy();
            return;
          }
        },
        function (err){
          res.json(500, {error:'something went wrong while getting student'});
          connection.destroy();
          return;
        }
      )



      sql="select * from Events left join EventParticipation on EventParticipation.eventId=Events.eventId where Events.eventId=?";
      inserts=[eventId];
      sql=mysql.format(sql, inserts);
      connection.query(sql).then(
        function (rows){
          maxParticipants=rows[0].participants

          for(i=0;i<rows.length;i++){
            if(rows[i].username!=null){
              participants++;
              if(rows[i].username==confirmedUsername){
                res.json(400, {error:'Student already registered as participant'});
                connection.destroy();
                return;
              }
            }
          }

          if(maxParticipants>participants){
            sql="insert into EventParticipation (username, eventId) values (?,?)";
            inserts=[confirmedUsername, eventId];
            sql=mysql.format(sql, inserts);

            connection.query(sql).then(
              function (rows){
                res.json(201, {success:'Student registered for event'});
                connection.destroy();
                return;
              },
              function (err){
                res.json(500, {error:'something went wrong while getting event'});
                connection.destroy();
                return;
              }
            );
          }

        },
        function (err){
          res.json(500, {error:'something went wrong while getting event'});
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
function joinEventRequest(req, res){

  var eventId=req.params.eventId || null;
  var username=req.body.username||null;


  if(eventId==null||dinnerParticipation==null||username==null){
    res.json(400, {error:'EventId and username must be provided'});
    return;
  }

  var participants=0;
  var maxParticipants=0;

  var confirmedUsername;

  pool.getConnection().then(
    function (connection){

      var sql="select * from Students where username=?"
      var inserts=[username, cardId];
      sql=mysql.format(sql, inserts);

      connection.query(sql).then(
        function (rows){
          if(rows.length==1){
            confirmedUsername=rows[0].username;
          }else{
            res.json(400, {error:'Username wrong'});
            connection.destroy();
            return;
          }
        },
        function (err){
          res.json(500, {error:'something went wrong while getting student'});
          connection.destroy();
          return;
        }
      )



      sql="select * from Events left join EventParticipation on EventParticipation.eventId=Events.eventId where Events.eventId=?";
      inserts=[eventId];
      sql=mysql.format(sql, inserts);
      connection.query(sql).then(
        function (rows){
          maxParticipants=rows[0].participants

          for(i=0;i<rows.length;i++){
            if(rows[i].username!=null){
              participants++;
              if(rows[i].username==confirmedUsername){
                res.json(400, {error:'Student already registered as participant'});
                connection.destroy();
                return;
              }
            }
          }

          if(maxParticipants>participants){
            sql="insert into EventParticipation (username, eventId) values (?,?)";
            inserts=[confirmedUsername, eventId];
            sql=mysql.format(sql, inserts);

            connection.query(sql).then(
              function (rows){
                res.json(201, {success:'student registered for event'});
                connection.destroy();
                return;
              },
              function (err){
                res.json(500, {error:'something went wrong while getting event'});
                connection.destroy();
                return;
              }
            );
          }

        },
        function (err){
          res.json(500, {error:'something went wrong while getting event'});
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
function registerAttendanceRequest(req, res){
  if(req.decoded.eventmanager==0){
    res.json(400, {error:'No access'});
    return;
  }

  var eventId=req.params.eventId || null;
  var cardId=req.body.cardId||null;
  var username=req.body.username||null;

  if(eventId==null||(cardId==null&&username==null)){
    res.json(400, {error:'EventId, username or cardId must be provided'});
    return;
  }
  if(isNaN(cardId)){
    res.json(400, {error:'CardId need to be formatted as number'});
    return;
  }

  var confirmedUsername;

  pool.getConnection().then(
    function (connection){

      var sql="select * from Students where username=? or studentCardId=?"
      var inserts=[username, cardId];
      sql=mysql.format(sql, inserts);

      connection.query(sql).then(
        function (rows){
          if(rows.length==1){
            confirmedUsername=rows[0].username;
          }else{
            res.json(400, {error:'Username or cardId wrong'});
            connection.destroy();
            return;
          }
        },
        function (err){
          res.json(500, {error:'something went wrong while getting student'});
          connection.destroy();
          return;
        }
      )



      sql="select * from EventParticipation where eventId=? and username=?";
      inserts=[eventId, confirmedUsername];
      sql=mysql.format(sql, inserts);
      connection.query(sql).then(
        function (rows){
          if(rows.length!=1){
            res.json(400, {error:'Student not a participant of this event'});
            connection.destroy();
            return;
          }

          sql="update EventParticipation set participated=1 where username=? and eventId=?";
          inserts=[confirmedUsername, eventId];
          sql=mysql.format(sql, inserts);

          connection.query(sql).then(
            function (rows){
              res.json(201, {success:'Student registered as participated'});
              connection.destroy();
              return;
            },
            function (err){
              res.json(500, {error:'something went wrong while getting event'});
              connection.destroy();
              return;
            }
          );


        },
        function (err){
          res.json(500, {error:'something went wrong while getting event'});
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
function removeParticipantionRequest(req, res){
  var eventId=req.params.eventId || null;
  var username=req.body.username||null;

  if(eventId==null||username==null){
    res.json(400, {error:'EventId and username must be provided'});
    return;
  }
  pool.getConnection().then(
    function (connection){

      var sql="delete from EventParticipation where eventId=? and username=?";
      var inserts=[eventId, username];
      sql=mysql.format(sql, inserts);

      connection.query(sql).then(
        function (rows){
          res.json(400, {success:'Student not participating in event'});
          connection.destroy();
          return;

        },
        function (err){
          res.json(500, {error:'something went wrong while removing participation'});
          connection.destroy();
          return;
        }
      );


    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );


}





module.exports = EventHandler;
