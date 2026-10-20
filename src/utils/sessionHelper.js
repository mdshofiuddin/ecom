const { refreshCsrfToken } = require('./csrfHelper');

function regenerateSessionWithUser(req, user, callback) {
  const existingCart = req.session.cart || [];
  req.session.regenerate((err) => {
    if (err) return callback(err);
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    req.session.cart = existingCart;
    refreshCsrfToken(req);
    callback(null, req.session.user);
  });
}

module.exports = { regenerateSessionWithUser };
