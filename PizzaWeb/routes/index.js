var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("view engine: "+ defaultEngine);
  res.render('index', { title: 'Order Pizza' });
  
});


module.exports = router;
