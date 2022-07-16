const express = require('express');

const helmet = require('helmet');

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const {
  celebrate, Joi, errors, isCelebrateError,
} = require('celebrate');

const cors = require('cors');

const validator = require('validator');

const usersRouter = require('./routes/users');

const articlesRouter = require('./routes/articles');

const { createUser, login } = require('./controllers/users');

const auth = require('./middleware/auth');

const BadRequestErr = require('./errors/bad-request-err');

const NotFoundErr = require('./errors/not-found-err');

require('dotenv').config();

const { requestLogger, errorLogger } = require('./middleware/logger');

const app = express();

const { PORT = 3000, NODE_ENV } = process.env;

app.use(cors());

app.options('*', cors());

app.use(helmet());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

function validateEmail(string) {
  if (!validator.isEmail(string)) {
    throw new Error('Invalid email');
  }
  return string;
}

app.post(
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

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail),
      password: Joi.string().min(6).required(),
    }),
  }),
  login,
);

app.use('/', auth, usersRouter);

app.use('/', auth, articlesRouter);

app.get('*', () => {
  throw new NotFoundErr('Requested resource not found');
});

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    throw new BadRequestErr(
      'Request cannot be completed at this time.',
    );
  }
  res.status(err.statusCode).send({
    message: err.statusCode === 500 ? 'An error occurred on the server' : err.message,
  });
  next();
});

mongoose.connect('mongodb://localhost:27017/newsexplorer', {
  useNewUrlParser: true,
});
if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('running on PORT: ', PORT);
  });
}
