const morgan = require('morgan');

module.exports =
  process.env.NODE_ENV === 'development'
    ? morgan('dev')
    : (req, res, next) => next();
