const BadRequestErr = require('../errors/bad-request-err');

const { isCelebrateError} = require('celebrate');

const { BAD_REQUEST, INTERNAL_SERVER } = require('../utils/status-codes');

module.exports = (err, req, res, next) => {
  if (isCelebrateError(err)) {
    throw new BadRequestErr(
      'Request cannot be completed at this time.', BAD_REQUEST
    );
  }
  res.status(err.statusCode).send({
    message: err.statusCode === INTERNAL_SERVER ? 'An error occurred on the server' : err.message,
  });
  next();
};