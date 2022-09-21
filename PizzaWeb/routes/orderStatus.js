var express = require('express');
var router = express.Router();


/* GET order status home page. */
router.get('/', function (req, res, next) {
    console.log("route to orderStatus")
    res.render('orderStatus', { title: 'Order Status' });
});

module.exports = router;