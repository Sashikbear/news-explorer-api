const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const auth = require('../middleware/auth');

const {
  getArticles,
  createArticle,
  deleteArticle,
} = require('../controllers/articles');

function validateUrl(string) {
  if (!validator.isURL(string)) {
    throw new Error('Invalid URL');
  }
  return string;
}

router.get('/articles', auth, getArticles);

router.post(
  '/articles',
  celebrate({
    body: Joi.object().keys({
      keyword: Joi.string().required(),
      title: Joi.string().required(),
      text: Joi.string().required(),
      date: Joi.string().required(),
      source: Joi.string().required(),
      link: Joi.string().custom(validateUrl).required(),
      image: Joi.string().custom(validateUrl).required(),
    }),
  }),
  auth,
  createArticle,
);

router.delete('/articles/:articleId', celebrate({
  params: Joi.object().keys({
    articleId: Joi.string().hex().min(24).max(24),
  }).unknown(true),
}), auth, deleteArticle);

module.exports = router;
