var express = require('express');
var router = express.Router();

// Require controllers
const ajaxController = require('../controllers/ajaxController');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//     req.isAuthenticated()
//       ? res.redirect('/admin/account')
//       : res.redirect('/login');
//   });

router.post('/delete-event-image/', ajaxController.deleteEventImage);

module.exports = router;