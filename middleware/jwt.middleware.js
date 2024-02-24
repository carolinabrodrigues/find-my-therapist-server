const { expressjwt: jwt } = require('express-jwt');

// instantiate the JWT token validation middleware
// decrypts the token
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload',
  getToken: getTokenFromHeaders,
});

function getTokenFromHeaders(req) {
  // checks if the token is available on the request headers
  // format: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    // get the token and return it
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }

  return null;
}

module.exports = { isAuthenticated };
