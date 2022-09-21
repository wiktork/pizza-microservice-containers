var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cons = require('consolidate');

var indexRouter = require('./routes/index');
var orderStatusRouter = require('./routes/orderStatus');

const axios = require('axios');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.engine('html', cons.swig)
app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'html');

app.use('/', indexRouter);
app.use('/orderStatus', orderStatusRouter);

app.use(express.json({ type: ['application/json', 'application/*+json'] }));

// dapr integration
// publish endpoint: http://localhost:<daprPort>/v1.0/publish/<pubsubname>/<topic>[?<metadata>]
const pubsubEndpoint = `http://localhost:3500/v1.0/publish/servicebus-pubsub/order`;

app.post('/submitOrder', function(req, res){
    axios.post(pubsubEndpoint, {
        "orderId": JSON.parse(req.body["orderID"]),
        "cart": JSON.parse(req.body["cart"]),
        "status": "created",
    })
        .then(function (response) {
            console.log("Submitted order : " + response.config.data);
        })
        .catch(function (error) {
            console.log("failed to publish message." + error);
        });
});

app.get('/getOrderStatus', function(req,res){
    console.log("invoked /getOrderStatus GET method");
    res.send("Ready");
});

module.exports = app;
