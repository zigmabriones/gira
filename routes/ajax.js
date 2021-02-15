var express = require('express');
var router = express.Router();

// Require controllers
const ajaxController = require('../controllers/ajaxController');
const validationController = require('../controllers/validationController');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//     req.isAuthenticated()
//       ? res.redirect('/admin/account')
//       : res.redirect('/login');
//   });

router.post('/cta-register', validationController.ctaVS, ajaxController.ctaRegister);
router.post('/delete-event-image/', ajaxController.deleteEventImage);

module.exports = router;