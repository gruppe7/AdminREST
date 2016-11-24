var bcrypt = require('bcrypt');
var mysql = require('promise-mysql');
var config = require('../config-release.js');

var pool = mysql.createPool(config.db.mysql);

var salt = bcrypt.genSaltSync(10);


var LockerHandler = function() {
  this.lockers=handleLockersRequest;
  this.reserve=reserveLockerRequest;
};


function handleLockersRequest(req, res){
  var semester=req.params.semester || null;

  if(semester==null ){
    res.json(400, 'semester not submitted');
    return;
  }

  var sql = "select Lockers.lockerId, Lockers.floor, count(sub.lockerId) as taken from Lockers left join (select * from LockerRent where semester=? ) as sub on Lockers.lockerId=sub.lockerId group by Lockers.lockerId";
  var inserts = [semester];
  sql=mysql.format(sql, inserts);

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
          res.json(500, {error:'something went wrong while getting lockers'});
          connection.destroy();
        }
      )
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );
}

function reserveLockerRequest(req, res){
  var semester=req.body.semester || null;
  var lockerId=req.params.lockerId || null;
  var username=req.body.username || null;

  if(semester==null || lockerId==null || username==null){
    res.json(400, 'semester, locker or username not submitted');
    return;
  }



  if(semester.length==5){
    var array=semester.split();
    var year = array[0]+array[1]+array[2]+array[3];
    if( year === parseInt(year, 10)){
      if(array[4]!='v' && array[4]!='h'){
        res.json(400, {error:'semester not formatted correctly'});
      }
    }else{
      res.json(400, {error:'semester not formatted correctly'});
    }
  }else{
    res.json(400, {error:'semester not formatted correctly'});
  }


  var sql = "select Lockers.*, count(sub.lockerId) as taken from Lockers left join (select LockerRent.lockerId from LockerRent where LockerRent.semester=?) as sub on sub.lockerId=Lockers.lockerId where Lockers.lockerId=? group by Lockers.lockerId";
  var inserts=[semester, lockerId];
  sql=mysql.format(sql, inserts);

  pool.getConnection().then(
    function (connection){
      connection.query(sql).then(
        function (rows){
          if(rows.length==0){
            res.json(400, {error:'locker does not exist'});
            connection.destroy();
            return;
          }else{
            if(rows[0].taken!=0){
              res.json(400, {error:'locker already reserved'});
              connection.destroy();
              return;
            }else{
              sql="SELECT Students.*, count(sub.lockerId) as rentedLockers FROM Students left join (select * from LockerRent where semester=?) as sub on Students.username=sub.username where Students.username=?";
              inserts=[semester, username];
              sql=mysql.format(sql, inserts);



              sql="insert into LockerRent (lockerId, username, semester, registered) values (?,?,?,NOW())";
              inserts=[lockerId, username, semester];
              sql=mysql.format(sql, inserts);

              connection.query(sql).then(
                function (rows){
                  res.json(201, {success:'locker reserved successfully', lockerId, username, semester});
                  connection.destroy();
                  return;
                },
                function(err){
                  res.json(400, {error:'wrong username'});
                  connection.destroy();
                  return;
                }
              )
            }
          }

          res.json(200, rows);
          connection.destroy();
          return;
        },
        function (err){
          res.json(500, {error:'something went wrong while getting lockers'});
          connection.destroy();
          return;
        })
    },
    function (err){
      res.json(500, {error:'could not connect to database'});
    }
  );

}

module.exports = LockerHandler;
