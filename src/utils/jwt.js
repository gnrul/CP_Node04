const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_ACCESS_SECRET || 'secret1';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'secret2';

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, accessSecret, { expiresIn: '15m' });
}

function signRefreshToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, refreshSecret, { expiresIn: '7d' });
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};