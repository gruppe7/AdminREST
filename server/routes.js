

function setup(app, handlers) {

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Max-Age", "1728000");

    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
  });
  //Studies
  app.get('/studies/', handlers.studies.studies);
  //lockers
  app.get('/lockers/:semester', handlers.lockers.lockers);
  //users
  app.post('/users/',handlers.users.login);
  //events
  app.get('/events/', handlers.events.events);
  //students
  app.post('/students/', handlers.students.new);
  app.post('/students/:username/updateCode/', handlers.students.updateCode);
  app.put('/students/:username/update/', handlers.students.update);
  app.put('/students/:username', handlers.students.verify);
  //members
  app.post('/members/', handlers.members.newMember);

  //LOGGED IN
  app.use(handlers.users.token);
  //students
  app.get('/students/', handlers.students.requestStudents);
  //members
  app.get('/members/', handlers.members.listMembers);
  app.put('/members/:memberId', handlers.members.verifyPayment);
  app.delete('/members/:memberId', handlers.members.removeMember);
  //events
  app.get('/event/:eventId', handlers.events.event);

}

exports.setup = setup;
