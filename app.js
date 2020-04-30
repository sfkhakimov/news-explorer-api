const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const users = require('./routes/users');
const articles = require('./routes/articles');
const { createUser, login, logout } = require('./controllers/users');
const middleware = require('./middlewares/middleware');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

mongoose.connect('mongodb://localhost:27017/news-explorer', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message('Поле email заполнено некорректно');
    }),
    password: Joi.string().required(),
  }),
}), createUser);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().custom((value, helpers) => {
      if (validator.isEmail(value)) {
        return value;
      }
      return helpers.message('Поле email заполнено некорректно');
    }),
    password: Joi.string().required(),
  }),
}), login);

app.use(auth);
app.put('/logout', logout);
app.use('/users', users);
app.use('/articles', articles);

app.use(middleware);
app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode)
    .send({
      message: statusCode === 500 ? 'На сервере произошла ошиюка' : message,
    });
});

app.listen(PORT, () => {
  console.log('server running on port 3000');
});
