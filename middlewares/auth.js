const { JWT_SECRET, NODE_ENV } = process.env;
const jwt = require('jsonwebtoken');
const Unauthorized = require('../errors/unauthorized');

module.exports = (req, res, next) => {
  const authorization = req.cookies.jwt;
  const unauthorized = new Unauthorized('Необходима авторизация');

  if (!authorization) {
    return res.status(unauthorized.statusCode).send(unauthorized.message);
  }

  let payload;

  try {
    payload = jwt.verify(authorization, NODE_ENV === 'production' ? JWT_SECRET : 'develop');
  } catch (err) {
    return res.status(unauthorized.statusCode).send(unauthorized.message);
  }
  req.user = payload;

  next();
};
