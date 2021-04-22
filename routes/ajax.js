var express = require('express');
var router = express.Router();

// Require controllers
const ajaxController = require('../controllers/ajaxController');
const validationController = require('../controllers/validationController');

// Home Page CTA Mailing List Registration
router.post('/cta-register', validationController.ctaVS, ajaxController.ctaRegister);

// Delete Event Image
router.post('/delete-event-image/', ajaxController.deleteEventImage);

module.exports = router;