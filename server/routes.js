function setup(app, handlers) {
  app.post('/api/profiles', handlers.account.createAccount);
}

exports.setup = setup;
