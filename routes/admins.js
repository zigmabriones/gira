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

// Registered Events
router.get('/miseventos', userController.misEventos);

// Mailing List
router.get('/mailing-list', adminController.mailingListGet);

// Event Management
router.get('/eventos', adminController.eventsGet);

// Create Event
router.get('/eventos/nuevo', adminController.eventCURDGet);
router.post('/eventos/nuevo', 
  adminController.upload,
  adminController.pushToS3,
  validationController.eventVS,
  adminController.newEventPost
);

// Edit Event
router.get('/eventos/editar/:eventId', adminController.eventCURDGet);
router.post('/eventos/editar/:eventId',
  adminController.upload,
  adminController.pushToS3,
  validationController.eventVS,
  adminController.editEventPost
);

// Delete Event
router.post('/eventos/borrar', adminController.deleteEventPost);

// Account Info
router.get('/cuenta', userController.accountGet);
router.post('/cuenta', validationController.editAccountVS, userController.accountPost);

// Manage Users (dev)
router.get('/usuarios', adminController.usersGet);
router.post('/usuarios', adminController.usersPost);

module.exports = router;
