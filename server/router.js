const controllers = require('./controllers');
const mid = require('./middleware');

// Connect routes
const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.post('/upgrade', mid.requiresLogin, controllers.Account.upgrade);

  app.get('/getFavorites', mid.requiresLogin, controllers.Account.getFavorites);
  app.get('/getUsers', mid.requiresLogin, controllers.Account.getUsers);
  app.get('/getPixts', mid.requiresLogin, controllers.Pixt.getPixts);
  app.post('/createPixt', mid.requiresLogin, controllers.Pixt.createPixt);
  app.post('/favorite', mid.requiresLogin, controllers.Account.favorite);
  app.post('/favPixt', mid.requiresLogin, controllers.Pixt.favorite);

  app.get('/profile', mid.requiresLogin, controllers.Pixt.profilePage);
  app.get('/', mid.requiresLogin, controllers.Pixt.mainPage);
};

module.exports = router;
