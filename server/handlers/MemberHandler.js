var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');
var input = require('../utils/input.js');

var mailer = require('nodemailer-promise');
var sendEmail= mailer.config(config.mailer);

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var MemberHandler = function() {
  this.newMember=newMemberRequest;
  this.listMembers=handleMembersRequest;
  this.verifyPayment=verifyPaymentRequest;
  this.removeMember=removeMemberRequest;
};


function newMemberRequest(req, res){
  var username=req.body.username || null;
  var receiptVipps=req.body.receiptVipps||null;
  var year=req.body.year||null;

  if(username==null||year==null){
    res.json(400, {error:'Username or year not submitted'});
    return;
  }

  if(receiptVipps!=null){
    if((receiptVipps!==parseInt(receiptVipps, 10)|| receiptVipps.length>16)){
      res.json(400, {error:'Vipps receipt not formatted correctly'});
      return;
    }
  }
  if(!input.checkYear(year)){
    res.json(400, {error:'year not submitted correctly'});
    return;
  }

  var sql = "select Members.* from Students left join Members on Students.username=Members.username where Students.username=? and Students.verified=1";
  var inserts = [username];
  sql=mysql.format(sql, inserts);


  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          if(rows.length==0){
            res.json(400, {error:'Student does not exist, or isnt verified'});
          }else{
            if(rows.length>=1){
              for(i=0;i<rows.length;i++){
                if(rows[i].year==year){
                  res.json(400, {error:'Member already registered'});
                  connection.destroy();
                  return;
                }
              }
            }

            sql="insert into Members (username, year, receiptVipps) values (?,?,?)";

            if(receiptVipps!=null){
              inserts=[username, year, receiptVipps];
            }else{
              inserts=[username, year, 0];
            }

            sql=mysql.format(sql, inserts);
            connection.query(sql).then(
              function (rows){
                res.json(201, {sucess:'Member registered'});
                connection.destroy();
                return;
              },
              function(err){
                res.json(500, {error:'error while registering member'});
                connection.destroy();
                return;
              }
            )
          }
        },
        function (err){
          res.json(500, {error:'something went wrong while getting student info'});
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
function handleMembersRequest(req, res){

  if(req.decoded.employee==0){
    res.json(400, {error:'No permission'});
    return;
  }

  var sql = "select * from Members";
  //var inserts = [semester];
  //sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          console.log(rows);
          res.json(200, rows);
          connection.destroy();
          return;
        },
        function (err){
          res.json(500, {error:'something went wrong while getting members from db'});
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
function verifyPaymentRequest(req, res){

  if(req.decoded.employee==0){
    res.json(400, {error:'No permission'});
    return;
  }

  var memberId=req.params.memberId||null;

  if(memberId==null){
    res.json(400, {error:'MemberId not submitted'});
    return;
  }

  if(isNaN(memberId)){
    res.json(400, {error:'MemberId not formatted correctly'});
    return;
  }

  var sql="update Members set payment=1 where memberId=? and payment=0";
  var inserts = [memberId];
  sql=mysql.format(sql, inserts);


  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          console.log(rows);
          if(rows.affectedRows==1){
            res.json(201, {sucess:'Payment registered'});
            connection.destroy();
            return;
          }else{
            res.json(400, {error:'Members payment already registered'});
            connection.destroy();
            return;
          }
          return;
        },
        function (err){
          res.json(500, {error:'something went wrong while updating payment info'});
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
function removeMemberRequest(req, res){
  if(req.decoded.employee==0){
    res.json(400, {error:'No permission'});
    return;
  }

  var memberId=req.params.memberId||null;

  if(memberId==null){
    res.json(400, {error:'MemberId not submitted'});
    return;
  }

  if(isNaN(memberId)){
    res.json(400, {error:'MemberId not formatted correctly'});
    return;
  }

  var sql="select * from Members where memberId=?";
  var inserts = [memberId];
  sql=mysql.format(sql, inserts);


  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){

          if(rows.length==1){
            var username=rows[0].username;
            var year=rows[0].year;

            sql="delete from Members where memberId=?";
            inserts=[memberId];
            sql=mysql.format(sql, inserts);

            connection.query(sql).then(
              function (rows){
                var options={
                  subject:'STØH-medlemskap',
                  senderName:config.mailsender,
                  receiver:username+config.studmail,
                  text:"Ditt medlemskap hos STØH er blitt slettet for året "+year+".",
                };

                sendEmail(options)
                  .then(function(info){
                    res.json(201, {success:'Membership deleted'});
                    connection.destroy();
                    return;
                  })
                  .catch(function(err){
                    res.json(500, {error:'Membership deleted, but mail failed to send'});
                    connection.destroy();
                    return;
                  });
              },
              function (err){
                res.json(500, {error:'something went wrong while deleting membership'});
                connection.destroy();
                return;
              }
            );

          }else{
            res.json(400, {error:'MemberId does not exist in db'});
            connection.destroy();
            return;
          }
        },
        function (err){
          res.json(500, {error:'something went wrong while updating payment info'});
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

module.exports = MemberHandler;
