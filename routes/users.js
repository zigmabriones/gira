var express = require('express');
var router = express.Router();

// Require controllers
const userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.isAuthenticated()
    ? res.redirect('/users/account')
    : res.redirect('/login');
});

router.get('/*', userController.isAuth);
router.get('/account', userController.accountView);

module.exports = router;
