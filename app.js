require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const validator = require('validator');
const cors = require('cors');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const router = require('./routes/index');
const { createUser, login, logout } = require('./controllers/users');
const { getArticleNewsApi } = require('./controllers/articles');
const middleware = require('./middlewares/middleware');
const auth = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const centralizedErrorHandler = require('./middlewares/centralizedErrorHandler');

const { PORT = 3000 } = process.env;
const whitelist = ['http://localhost:8080', 'http://planet-news.ml', 'https://planet-news.ml'];
const corsOptions = {
  credentials: true,
  origin: whitelist,
};
const app = express();

mongoose.connect('mongodb://localhost:27017/news-explorer', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(cookieParser());
app.use(requestLogger);

app.options('*', cors(corsOptions), (req, res) => {
  res.status(200).send('OK');
});
app.use(cors(corsOptions));

app.get('/news-api', getArticleNewsApi);

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
app.use('/', router);

app.use(middleware);
app.use(errorLogger);

app.use(errors());
app.use(centralizedErrorHandler);

app.listen(PORT, () => {
  console.log('server running on port 3000');
});
