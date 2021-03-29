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
router.post('/login', validationController.loginVS, userController.loginPost);

// Sign Up
router.get('/unete', userController.signUpGet);
router.post('/unete',
  validationController.signupVS,
  userController.signUpPost,
  userController.sendVerificationEmail,
  userController.loginPost
);

// Forgot Password
router.get('/recuperacion', indexController.passwordRequestGet);
router.post('/recuperacion', validationController.pwrequestVS, indexController.passwordRequestPost);

router.get('/pwr/:token', indexController.passwordResetGet);
router.post('/pwr/:token', validationController.pwresetVS, indexController.passwordResetPost);

// Verify
router.get('/v/:token', userController.verify);

// Logout
router.get('/logout', userController.logout);

module.exports = router;
