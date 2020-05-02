const models = require('../models');

const { Account } = models;

// Render login page
const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// Log out current user
const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

// Process login and redirect to main app
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

// Create a new account
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

// Fetch all users
const getUsers = (request, response) => Account.AccountModel.findUsers((err, docs) => {
  if (err) {
    console.log(err);
    return response.status(400).json({ error: 'Error' });
  }

  return response.json({ users: docs });
});

// Get the favorites (among other generally-useful data) for the current user
const getFavorites = (request, response) => Account.AccountModel.findFavorites(
  request.session.account._id, (err, doc) => {
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'Error' });
    }

    return response.json({ favorites: doc.favorites, userID: doc._id, premium: doc.premium });
  },
);

// Add or remove a favorite Pixt for the user
const favorite = (request, response) => {
  const search = {
    _id: request.session.account._id,
  };

  Account.AccountModel.findOne(search, (err, docc) => {
    const doc = docc;
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'Error' });
    }

    const toFav = request.body.toFav === 'true';

    if (toFav) {
      doc.favorites += `${request.body.pixtID} `;
    } else {
      doc.favorites = doc.favorites.replace(request.body.pixtID, '');
    }

    doc.save((errr) => {
      if (errr) {
        console.log(errr);
        return response.status(400).json({ error: 'Error' });
      }
      return response.json({});
    });
    return 0;
  });
};

// Change the user's password
const changePassword = (request, response) => {
  const search = {
    _id: request.session.account._id,
  };

  Account.AccountModel.findOne(search, (err, docc) => {
    const doc = docc;
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'Error' });
    }

    const { password } = request.body;

    return Account.AccountModel.generateHash(password, (salt, hash) => {
      // Data for the new account
      const accountData = {
        salt,
        password: hash,
      };

      doc.salt = accountData.salt;
      doc.password = accountData.password;

      doc.save((errr) => {
        if (errr) {
          console.log(errr);
          return response.status(400).json({ error: 'Error' });
        }
        return response.json({});
      });
    });
  });
};

// Upgrade the account to premium
const upgrade = (request, response) => {
  const search = {
    _id: request.session.account._id,
  };

  Account.AccountModel.findOne(search, (err, docc) => {
    const doc = docc;
    if (err) {
      console.log(err);
      return response.status(400).json({ error: 'Error' });
    }

    // Sometimes it really do be like that
    doc.premium = true;

    doc.save((errr) => {
      if (errr) {
        console.log(errr);
        return response.status(400).json({ error: 'Error' });
      }
      return response.json({});
    });
    return 0;
  });
};

// Fetch the csrf token
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
  getUsers,
  getFavorites,
  favorite,
  changePassword,
  upgrade,
  getToken,
};
