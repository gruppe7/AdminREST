"use strict"
var config = require('./config.js');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var https = require('https');
var mysql = require('mysql');


//HTTPS
var privateKey = fs.readFileSync('server/sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('server/sslcert/server.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var app = express();

var pool = mysql.createPool(config.db.mysql);


pool.getConnection(
  function(err, connection){
    connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
      if (err) throw err;
      console.log('The solution is: ', rows[0].solution);
    })
  });


//Make app automatically parse json content
app.use(bodyParser.json());




function verifyUsername(username, callback){
  var result=false;

  var sql = "select * from Students where username=?";
  var inserts = [username];
  sql = mysql.format(sql, inserts);

  pool.getConnection(function(err, connection){
    connection.query(sql, function(err, rows){
      if(rows.length==1){
        console.log(true);
        result=true;
      }
      callback(result);
    })
  });
}



//verify username
app.get('/students/:username', (request, response) => {
  console.log(request.params.username);
  verifyUsername(request.params.username, function(result){
    response.send(result);
  });
});



//Add new customer if name and city contain data
app.post('/customers', (request, response) => {
  if(request.body.name && request.body.city) {
    customers.push(new Customer(request.body.name, request.body.city));
    response.send(customers[customers.length-1].id.toString());
    return;
  }
  //Respond with bad request status code
  response.sendStatus(400);
});


var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443, function(){
        console.log("server running at https://localhost:8443/")
});
