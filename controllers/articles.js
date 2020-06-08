const NewsAPI = require('newsapi');
const Article = require('../models/article');
const NotFound = require('../errors/notFound');
const Forbidden = require('../errors/forbidden');

const newsapi = new NewsAPI('1a27ff3603c6422681720b80c8a7cb70');

const createArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;
  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner: req.user._id,
  })
    .then((article) => res.status(201).send({
      keyword: article.keyword,
      title: article.title,
      text: article.text,
      date: article.date,
      source: article.source,
      link: article.link,
      image: article.image,
    }))
    .catch(next);
};

const getArticle = (req, res, next) => {
  Article.find({ owner: req.user._id }).orFail(new NotFound('Не удалось найти карточки'))
    .then((article) => res.send({ article }))
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findById(req.params.articleId).select('+owner')
    .orFail(new NotFound('Не удалось найти карточку'))
    .then((article) => {
      if (!article.owner.equals(req.user._id)) {
        throw new Forbidden('Вы не можете удалять чужие карточки');
      }
      return Article.findByIdAndDelete(req.params.articleId).select('-owner')
        .then((item) => res.send({ item }));
    })
    .catch(next);
};

const getArticleNewsApi = (req, res, next) => {
  const {
    keyword,
    fromDate,
    toDate,
    sort,
    resultSize,
  } = req.query;
  newsapi.v2.everything({
    q: keyword,
    from: fromDate,
    to: toDate,
    sortBy: sort,
    pageSize: resultSize,
  })
    .then((articles) => res.send(articles))
    .catch(next);
};

module.exports = {
  createArticle,
  getArticle,
  deleteArticle,
  getArticleNewsApi,
};
