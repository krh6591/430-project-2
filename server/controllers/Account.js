const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // Cast to strings
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing Username/Password' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(400).json({ error: 'Incorrent Username/Password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);
    return res.json({ redirect: '/' });
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  // Cast to strings
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  // Validity check fields
  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'Missing Username/Password' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords Don\'t Match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    // Data for the new account
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
    };

    // Create the new account
    const newAccount = new Account.AccountModel(accountData);
    const savePromise = newAccount.save();
    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/' });
    });

    // Handle creation errors
    savePromise.catch((err) => {
      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username Already Taken' });
      }

      return res.status(400).json({ error: 'Error' });
    });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  getToken,
};
