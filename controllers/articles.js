const NotFoundErr = require('../errors/not-found-err');

const BadRequestErr = require('../errors/bad-request-err');

const ForbiddenErr = require('../errors/forbidden-err');

const Article = require('../models/article');

const {
  OK, CREATED, NOT_FOUND, BAD_REQUEST, FORBIDDEN,
} = require('../utils/status-codes');

const getArticles = (req, res, next) => {
  Article.find({})
    .orFail(() => {
      throw new NotFoundErr('The articles were not found', NOT_FOUND);
    })
    .then((articles) => res.status(OK).send(articles))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => res.status(CREATED).res.send(article))
    .catch((err) => {
      if (err.name === 'ValidationError') next(new BadRequestErr('Validation failed. Check your request format', BAD_REQUEST));
      else next(err);
    });
};

const deleteArticle = (req, res, next) => {
  Article.findByIdAndRemove(req.params.articleId)
    .orFail(() => {
      throw new NotFoundErr('The requested article was not found', NOT_FOUND);
    })
    .then((article) => {
      if (article.owner.equals(req.user._id)) res.send(article);
      else {
        throw new ForbiddenErr('You cannot delete an article that does not belong to you', FORBIDDEN);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequestErr('Invalid data.', BAD_REQUEST));
      else next(err);
    });
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,

};
