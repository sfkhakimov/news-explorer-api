const { JWT_SECRET, NODE_ENV } = process.env;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFound = require('../errors/notFound');

const createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  User.find({ email })
    .then((client) => {
      if (client.length !== 0) {
        throw Error('Пользователь с таким email уже существует');
      }
      return bcrypt.hash(password, 10)
        .then((hash) => User.create({
          email,
          name,
          password: hash,
        }))
        .then((user) => {
          res.status(201).send({
            email: user.email,
            name: user.name,
          });
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'develop');
      res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true }).send(user);
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.user._id).orFail(new NotFound('Ресурс не найден'))
    .then((user) => res.send(user))
    .catch(next);
};



module.exports = {
  createUser,
  login,
  getUser,
};
