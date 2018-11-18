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
var tumblrController = require('./controller/control');
//include async module
var async = require('async');
//get the tweets model
var TumblrDB = require('./model/tumblrSchema');
//get the consumer and access keys from JSON
var keys = require('./keys/keys');
//include tumblr
var tumblr = require('tumblr.js');
// Authenticate via OAuth 1.0a
var client = tumblr.createClient({
    consumer_key: keys.consumer_key,
    consumer_secret: keys.consumer_secret,
    token: keys.token,
    token_secret: keys.token_secret
});
//variable to store the names of all blogs the current user follows
var allBlogNameArray = [];

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

async.waterfall([
    //1. Function to get names of all blogs the user follows
    function (callback) {
        client.userFollowing(function (err, follows) {
            async.forEachSeries(follows.blogs, function (eachBlog, callback) {
                    allBlogNameArray.push(eachBlog.name);
                    callback();
                },
                function (errInAsync) {
                    if (errInAsync) {
                        logger.error('Error in async series of saveEachBlogUserFollows');
                        callback(null, allBlogNameArray);
                    } else {
                        logger.info('Going to the next function to get posts of each blog the user follows');
                        callback(null, allBlogNameArray);
                    }
                });
        });
    },
    //2. Function to get each blog post and save in the database
    function (allBlogNameArray, callback) {
        async.forEachSeries(allBlogNameArray, function(eachBlog, callback) {
            client.blogPosts(eachBlog, function (err, resp) {
                TumblrDB.tumblrSchema(resp).save(function (err, savedBlog) {
                    //handle error case
                    if (err) {
                        //If error in saving to database, log it
                        logger.error('Error occured in saving blog to database: ' + JSON.stringify(err));
                        //continue to the next iteration
                        callback();
                    } else {
                        logger.info('Saved the ' + resp.blog.name + ' blog data');
                        //continue to the next iteration to save the next blog to the database
                        callback();
                    }
                });
            });
        },
        function(errFinal){
            if (errFinal) {
                logger.error('Error in async of finding blog data for each blog');
                callback(null);
            } else {
                logger.info('Going to function 3');
                callback(null);
            }
        });
    },
    //3. Function to perform analytics on database
    function (callback) {
        //function to perform analytics on the saved data
        tumblrController.analytics();
        callback(null);
    }
], function (err, result) {
    logger.info('Main waterfall completed, now working on event callback for other analytics');
})

/**
 * ######################################################################################################################################################################################################
 * Official tumblr data received at once is 20 at the maximum even if the hit is done more than once - This is an analysis as the maximum posts got is 20.
 * ######################################################################################################################################################################################################
 */