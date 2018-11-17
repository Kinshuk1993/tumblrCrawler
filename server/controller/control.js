'use strict';

//get the tweets model
var TweetsDB = require('../model/tumblrSchema');
//get the consumer and access keys from JSON
var keys = require('./../keys/keys');

//include async module
var async = require('async');
//include path module
var path = require('path');
//specify the log folder name
var logDir = 'Tumblr-Crawler-Logs';
//get the log directory
var logFile = path.resolve(__dirname + "/" + logDir);
//include logger config
var logger = require('../logger-config/log-config');
//include output file config
var output = require('../logger-config/finalOutput');

exports.getData = function() {
    logger.info('Logs captured');
    output.info('Output captured');
}

//function to handle the error response
function handleError(res, err) {
    logger.info("Error encountered in handleError: " + JSON.stringify(err));
    //return
    return res.send(500, err);
}