var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('opening', { title: 'Gira' });
});

router.get('/inicio', function(req, res, next) {
  res.render('index', { title: 'Gira' });
});

module.exports = router;
