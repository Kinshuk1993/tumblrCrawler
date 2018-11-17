'use strict';

//require dependencies and inbuild files
var express = require('express');
var path = require('path');
var fs = require('fs');
var logDir = 'Tumblr-Crawler-Logs';
var outputLogDir = 'Tumblr-Crawler-Final-Output-Log';
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./model/config');
var logger = require('./logger-config/log-config');
var tumblrController = require('./controller/control')

//create the program log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

//create the program output log directory if it does not exist
if (!fs.existsSync(outputLogDir)) {
    fs.mkdirSync(outputLogDir);
}

//initialize express
const app = express();

//Coonect to the mongo database
mongoose.connect(config.url, {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        logger.error("Problem in connecting to the mongoDB database: " + JSON.stringify(err));
    }
    logger.info('Successfully connected to database');
});

//Middleware for bodyparsing using both json and urlencoding
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/**
 * express.static is a built in middleware function to serve static files.
 * We are telling express server public folder is the place to look for the static files
 */
app.use(express.static(path.join(__dirname, 'public')));

//Routing all HTTP requests to /getTweets
//Commented out: TO-DO...a later stage
// app.use('/api/getData', getTweets);

/**
 * resond to http get method, first param is path
 * and then http request and response params
 * handle any unknown paths
 */
app.get('/*', (req, res) => {
    logger.info("Path not found error..!!");
    res.send("Page not Found Error");
});

tumblrController.getData();