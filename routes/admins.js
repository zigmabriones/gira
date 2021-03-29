var express = require('express');
var router = express.Router();

// Require controllers
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const validationController = require('../controllers/validationController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  req.isAuthenticated()
    ? res.redirect('/admin/miseventos')
    : res.redirect('/usuarios');
});

router.get('/*', adminController.isAuth);
router.get('/miseventos', userController.misEventos);

router.get('/mailing-list', adminController.mailingListGet);

router.get('/eventos', adminController.eventsGet);

router.get('/eventos/nuevo', adminController.eventCURDGet);
// Will create an S3 bucket with images even though there was a validation error
router.post('/eventos/nuevo', 
  adminController.upload,
  adminController.pushToS3,
  validationController.eventVS,
  adminController.newEventPost
);

router.get('/eventos/editar/:eventId', adminController.eventCURDGet);
router.post('/eventos/editar/:eventId',
  adminController.upload,
  adminController.pushToS3,
  validationController.eventVS,
  adminController.editEventPost
);
router.post('/eventos/borrar', adminController.deleteEventPost);

router.get('/cuenta', userController.accountGet);
router.post('/cuenta', validationController.editAccountVS, userController.accountPost);

router.get('/usuarios', adminController.usersGet);
router.post('/usuarios', adminController.usersPost);

module.exports = router;
