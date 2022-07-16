const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const LoginErr = require('../errors/login-err');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
    select: false,
  },
  name: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 30,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password,
) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new LoginErr('Incorrect email or password'));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new LoginErr('Incorrect email or password'));
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
