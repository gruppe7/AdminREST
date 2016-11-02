var mysql = require('promise-mysql');
var config = require('../config-release.js');
var input = require('../utils/input.js');

var pool = mysql.createPool(config.db.mysql);

var tokens = require('../utils/TokenCreator.js');

var mailer = require('nodemailer-promise');

var sendEmail= mailer.config(config.mailer);

var StudentHandler = function() {
  this.new=newStudentRequest;
  this.verify=verifyStudentRequest;
};



function newStudentRequest(req, res){
  var username=req.body.username || null;
  var firstname=req.body.firstname || null;
  var lastname=req.body.lastname || null;
  var studentCardId=req.body.studentCardId || null;
  var year = req.body.year || null;
  var studyId = req.body.studyId || null;



  if(username==null || firstname==null || lastname==null || year==null || studyId==null){
    res.json(400, {error:'username, firstname, lastname year or study not submitted'});
    return;
  }

  if(!input.checkYear(year)){
    res.json(400, {error:'year not submitted correctly'});
    return;
  }
  if(!studyId === parseInt(studyId, 10)){
    res.json(400, {error:'study not submitted correctly'});
    return;
  }


  var sql = "select * from Students where Students.username=?";
  var inserts = [username];

  if(studentCardId!=null){
    if(studentCardId === parseInt(studentCardId, 10)){
      sql = "select * from Students where Students.username=? or Students.studentCardId=?";
      inserts=[username, studentCardId];
    }else{
      res.json(400, {error:'card id not formatted correctly'});
      return;
    }
  }

  sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          if(rows.length==0){

            var token=tokens(16);

            sql="insert into Students (username, firstname, lastname, verifyingCode, studentCardId, year, studyId) values (?,?,?,?,?,?,?)";
            inserts=[username, firstname, lastname, token, studentCardId, year, studyId];
            sql=mysql.format(sql, inserts);
            connection.query(sql).then(
              function (rows){
                var options={
                  subject:'STØH-registrering',
                  senderName:config.mailsender,
                  receiver:username+config.studmail,
                  text:" Du er blitt registrert som student i Støh's systemer. Verifiser at du er student her: http://localhost:8443/students/"+username+"?token="+token,
                };

                sendEmail(options)
                  .then(function(info){
                    res.json(201, {username, firstname, lastname, studentCardId, year, studyId});
                  })
                  .catch(function(err){
                    console.log(err);
                    res.json(500, {error:'Student registered, but mail failed to send'});
                  });
              },
              function(err){
                res.json(500, {error:'error while registering student'});
              }
            )
          }else{
            res.json(400, {error:'student or card is already registered'});
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
  var token = req.query.token || null;

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
            if(rows[0].verifyingCode.localeCompare(token)==0){
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
