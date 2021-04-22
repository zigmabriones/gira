var express = require('express');
var router = express.Router();

// Require controllers
const userController = require('../controllers/userController');
const validationController = require('../controllers/validationController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) return res.redirect('/login');

  req.user.permissions == 'dev' || req.user.permissions == 'admin'
    ? res.redirect('/admin')
    : res.redirect('/usuarios/miseventos');
});

router.get('/*', userController.isAuth);

// Registered Events
router.get('/miseventos', userController.misEventos);

// Account Info
router.get('/cuenta', userController.accountGet);
router.post('/cuenta', validationController.editAccountVS, userController.accountPost);

module.exports = router;
