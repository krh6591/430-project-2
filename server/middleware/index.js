// Re-route if login needed
const requiresLogin = (req, res, next) => {
  if (!req.session.account) {
    return res.redirect('/login');
  }
  return next();
};

// Re-route if already logged in
const requiresLogout = (req, res, next) => {
  if (req.session.account) {
    return res.redirect('/');
  }
  return next();
};

const requiresSecure = (req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  return next();
};

const bypassSecure = (req, res, next) => {
  next();
};

module.exports = {
  requiresLogin,
  requiresLogout,
  requiresSecure: (process.env.NODE_ENV === 'production' ? requiresSecure : bypassSecure),
};
