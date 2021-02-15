var express = require('express');
var router = express.Router();

// Require controller modules
const indexController = require('../controllers/indexController');
const userController = require('../controllers/userController');
const validationController = require('../controllers/validationController');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('opening', { title: 'Gira' });
});

// Index
router.get('/inicio', indexController.index);

// Events
router.get('/eventos', indexController.events);
router.get('/eventos/:eventUri', indexController.event);

// Login
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

// Sign Up
router.get('/unete', userController.signUpGet);
router.post('/unete',
  validationController.signupVS,
  userController.signUpPost,
  userController.loginPost
);

// Logout
router.get('/logout', userController.logout);

module.exports = router;
