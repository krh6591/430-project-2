const controllers = require('./controllers');
const mid = require('./middleware');

// Connect routes
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/getPixts', mid.requiresLogin, controllers.Pixt.getPixts);
  app.post('/createPixt', mid.requiresLogin, controllers.Pixt.createPixt);

  app.get('/', mid.requiresLogin, controllers.Pixt.mainPage);
};

module.exports = router;
