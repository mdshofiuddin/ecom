const crypto = require('crypto');

function refreshCsrfToken(req) {
  if (req && req.session) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    return req.session.csrfToken;
  }
  return null;
}

module.exports = { refreshCsrfToken };
