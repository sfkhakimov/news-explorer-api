const Article = require('../models/article');
const NotFound = require('../errors/notFound');
const Forbidden = require('../errors/forbidden');

const createArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner = req.user._id,
  } = req.body;
  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner,
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
      return Article.findByIdAndDelete(req.params.articleId)
        .then((item) => res.send({
          keyword: item.keyword,
          title: item.title,
          text: item.text,
          date: item.date,
          source: item.source,
          link: item.link,
          image: item.image,
        }));
    })
    .catch(next);
};

module.exports = {
  createArticle,
  getArticle,
  deleteArticle,
};
