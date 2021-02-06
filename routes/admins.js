var express = require('express');
var router = express.Router();

// Require controllers
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.isAuthenticated()
    ? res.redirect('/admin/account')
    : res.redirect('/login');
});

router.get('/*', userController.isAuth);
router.get('/account', adminController.account);

router.get('/mailing-list', adminController.mailingListGet);

router.get('/event/new', adminController.newEventGet);

module.exports = router;
