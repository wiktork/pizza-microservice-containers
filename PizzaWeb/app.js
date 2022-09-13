var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

//TODO: add Dapr integration for sending order and price in req.body to event broker
app.post('/submitOrder', function(req, res){
    var cart = JSON.parse(req.body["cart"]);
    var orderId = JSON.parse(req.body["orderID"]);

    cartToSend = [];

    cartToSend.push({"orderId": orderId});

    cart.forEach(element => {
        cartToSend.push({"name":element.name, "price": element.price, "count": element.count});
    });

    console.log(JSON.parse(req.body["orderID"]));
    console.log(JSON.parse(req.body["cart"]));
    //TODO: send JSON.stringify(cartToSend) to the pub/sub event bus
    console.log(JSON.stringify(cartToSend));
    res.sendStatus(200);
});

module.exports = app;
