const NotFoundErr = require('../errors/not-found-err');
const BadRequestErr = require('../errors/bad-request-err');
const ForbiddenErr = require('../errors/forbidden-err');
const Article = require('../models/article');

const getArticles = (req, res, next) => {
  Article.find({})
    .orFail(() => {
      throw new NotFoundErr('The articles were not found');
    })
    .then((articles) => res.status(200).send(articles))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => res.status(201).res.send(article))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestErr('Validation failed. Check your request format'));
      else next(err);
    });
};

const deleteArticle = (req, res, next) => {
  Article.findByIdAndRemove(req.params.articleId)
    .orFail(() => {
      throw new NotFoundErr('The requested article was not found');
    })
    .then((article) => {
      if (article.owner.equals(req.user._id)) res.send(article);
      else {
        throw new ForbiddenErr(
          'You cannot delete an article that does not belong to you',
        );
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequestErr('Invalid data.'));
      else next(err);
    });
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,

};
