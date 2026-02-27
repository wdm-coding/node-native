const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || '6a2263e5-1b9e-43de-9ac3-a377403c4419'

function generateToken(payload, expiresIn = '1h') {
  return jwt.sign(payload, secret, { expiresIn });
}


function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken
};