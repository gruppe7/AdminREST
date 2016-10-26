

function setup(app, handlers) {

  app.get('/lockers/:semester', handlers.lockers.lockers);

  app.post('/users/',handlers.users.login);
  app.get('/events/', handlers.events.events);
  app.post('/students/', handlers.students.new);
  app.get('/students/:username', handlers.students.verify);
  app.use(handlers.users.token);


}

exports.setup = setup;
