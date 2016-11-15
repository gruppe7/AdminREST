

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
  app.get('/lockers/:semester', handlers.lockers.lockers);
  app.post('/users/',handlers.users.login);
  app.get('/events/', handlers.events.events);
  app.post('/students/', handlers.students.new);
  app.get('/students/:username', handlers.students.verify);
  app.use(handlers.users.token);


}

exports.setup = setup;
