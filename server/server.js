"use strict"
var config = require('./config-release.js');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var https = require('https');
var http =require('http');

var bcrypt = require('bcrypt');

var salt = bcrypt.genSaltSync(10);

var UserHandler = require('./handlers/UserHandler.js');
var LockerHandler = require('./handlers/LockerHandler.js');
var EventHandler = require('./handlers/EventHandler.js');
var StudentHandler = require('./handlers/StudentHandler.js');
var StudyHandler = require('./handlers/StudyHandler.js');
var MemberHandler = require('./handlers/MemberHandler.js');

var routes = require('./routes.js');



//HTTPS
//var privateKey = fs.readFileSync('server/sslcert/key.pem', 'utf8');
//var certificate = fs.readFileSync('server/sslcert/server.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

var app = express();

app.set('superSecret', config.secret);


//Make app automatically parse json content
app.use(bodyParser.json());

var handlers = {
  users: new UserHandler(),
  lockers: new LockerHandler(),
  events: new EventHandler(),
  students: new StudentHandler(),
  studies: new StudyHandler(),
  members: new MemberHandler(),
};

routes.setup(app, handlers);

var httpServer= http.createServer(app);
httpServer.listen(8443);

/*var httpsServer = https.createServer(credentials, app);

httpsServer.listen(8443, function(){
        console.log("server running at https://localhost:8443/")
});
*/
