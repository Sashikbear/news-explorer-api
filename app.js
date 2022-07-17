const express = require('express');

const helmet = require('helmet');

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const {
errors
} = require('celebrate');

const cors = require('cors');

const mainRouter = require('./routes');

const NotFoundErr = require('./errors/not-found-err');

const centralizedErr = require('./middleware/centralized-err')

const { limiter } = require('./utils/rate-limiter');

require('dotenv').config();

const { requestLogger, errorLogger } = require('./middleware/logger');

const { MONGODB_URL } = require('./utils/constants');

const {NOT_FOUND} = require('./utils/status-codes');

const app = express();

const { PORT = 3000, NODE_ENV, MONGODB = MONGODB_URL } = process.env;

app.use(limiter);

app.use(cors());

app.options('*', cors());

app.use(helmet());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);

app.use('/', mainRouter);

app.get('*', () => {
  throw new NotFoundErr('Requested resource not found', NOT_FOUND);
});

app.use(errorLogger);

app.use(errors());

app.use(centralizedErr);

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
});

if (NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('running on PORT: ', PORT);
  });
}
