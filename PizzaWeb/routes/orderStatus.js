let appInsights = require("applicationinsights");
appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
    .start();
var express = require('express');
var router = express.Router();


/* GET order status home page. */
router.get('/', function (req, res, next) {
    console.log("route to orderStatus")
    res.render('orderStatus', { title: 'Order Status' });
});

module.exports = router;