const router = require('express').Router();
const { createArticle, getArticle, deleteArticle } = require('../controllers/articles');

router.get('/', getArticle);
router.post('/', createArticle);
router.delete('/:articleId', deleteArticle);

module.exports = router;
