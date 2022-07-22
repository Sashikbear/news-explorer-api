const router = require('express').Router();
const articleRoute = require('./articles');
const userRoute = require('./users');

router.use(userRoute, articleRoute);

module.exports = router;
