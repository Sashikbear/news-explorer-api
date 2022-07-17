const router = require('express').Router();

const validator = require('validator');

const { celebrate, Joi } = require('celebrate');

const auth = require('../middleware/auth');

const {
  getCurrentUser, createUser, login,
} = require('../controllers/users');

function validateEmail(string) {
  if (!validator.isEmail(string)) {
    throw new Error('Invalid email');
  }
  return string;
}

router.get('/users/me', auth, getCurrentUser);

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail),
      name: Joi.string().min(2).max(30).required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  createUser,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail),
      password: Joi.string().min(6).required(),
    }),
  }),
  login,
);

module.exports = router;
