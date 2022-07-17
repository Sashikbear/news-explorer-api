const jwt = require('jsonwebtoken');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;
const LoginErr = require('../errors/login-err');

const { UNAUTHORIZED } = require('../utils/status-codes');

const { JWT_DEV_SECRET } = require('../utils/constants');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new LoginErr('Authorization Required', UNAUTHORIZED));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : JWT_DEV_SECRET,
    );
  } catch (err) {
    next(new LoginErr('Authorization Required', UNAUTHORIZED));
  }
  req.user = payload;

  next();
};
