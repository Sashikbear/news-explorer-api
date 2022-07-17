const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const User = require('../models/user');
const NotFoundErr = require('../errors/not-found-err');
const BadRequestErr = require('../errors/bad-request-err');
const LoginErr = require('../errors/login-err');
const EmailConflictErr = require('../errors/email-conflict-err');

const { JWT_DEV_SECRET } = require('../utils/constants');
const { OK, CREATED, NOT_FOUND, BAD_REQUEST, CONFLICT, UNAUTHORIZED} = require('../utils/status-codes');

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(OK).send({ email: user.email, name: user.name }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(
          new BadRequestErr('Validation failed. Check your request format.', BAD_REQUEST),
        );
      } else next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    email, name, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email, name, password: hash,
    }))
    .then((user) => res.status(201).send({
      _id: user._id,
      email: user.email,
      name: user.name,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestErr('Validation failed. Check your request format', BAD_REQUEST));
      else if (err.code === 11000) next(new EmailConflictErr('This email has already been registered', CONFLICT));
      else next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new NotFoundErr('User not found', NOT_FOUND);
      }
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : JWT_DEV_SECRET,
        { expiresIn: '7d' },
      );

      res.cookie('token', token, { httpOnly: true });
      res.status(CREATED).send({
        token,
        user: {
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch(() => {
      next(new LoginErr('Authorization Required', UNAUTHORIZED));
    });
};

module.exports = {
  getCurrentUser,
  createUser,
  login,
};
