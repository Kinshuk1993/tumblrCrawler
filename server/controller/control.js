'use strict';

//get the tweets model
var TumblrDB = require('../model/tumblrSchema');
//get the consumer and access keys from JSON
var keys = require('./../keys/keys');
//include tumblr
var tumblr = require('tumblr.js');
// Authenticate via OAuth 1.0a
var client = tumblr.createClient({
    consumer_key: keys.consumer_key,
    consumer_secret: keys.consumer_secret,
    token: keys.token,
    token_secret: keys.token_secret
});

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
//variable to store the names of all blogs the current user follows
var allBlogNameArray = [];
//variable to store the total blog data
var totalBlogData = [];

//function to get the the number of followings
exports.getNumberOfBlogsFollowed = function () {
    //method to get the number of blogs the current user is following
    client.userFollowing(function (err, follows) {
        console.log(JSON.stringify(follows));
        //log the output to the output files
        logger.info('The number of blogs the current user follows: ' + JSON.stringify(follows.total_blogs));
        output.info('The number of blogs the current user follows: ' + JSON.stringify(follows.total_blogs));
    });
}

exports.saveEachBlogUserFollows = function () {
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
                    callback(null, allBlogNameArray);
                } else {
                    logger.info('Going to function 3');
                    callback(null, allBlogNameArray);
                }
            });
        },
    ], function (err, result) {
        logger.info('Total number of blog data saved: ' + allBlogNameArray.length);
    })
}

//Function to perform analytics on the saved data
exports.analytics = function() {
    async.waterfall([
        //1. Function to find all data saved in the database
        function(callback) {
            TumblrDB.tumblrSchema.find({}, function(err, eachBlogData){
                if (err) {
                    logger.error('Error in finding data in the database ' + JSON.stringify(err));
                    //go to next function
                    callback(null, totalBlogData);
                } else {
                    //push the data to an array
                    totalBlogData = eachBlogData;
                    //go to next function
                    callback(null, totalBlogData);
                }
            });
        },
        //2. Function to count total post for each blog
        function(totalBlogData, callback) {
            //loop over the blog data
            async.forEachSeries(totalBlogData, function(eachBlog, callback) {
                logger.info('Total posts of blog ' + JSON.parse(JSON.stringify(eachBlog)).blog.name + ' are: ' + JSON.parse(JSON.stringify(eachBlog)).total_posts);
                output.info('Total posts of blog ' + JSON.parse(JSON.stringify(eachBlog)).blog.name + ' are: ' + JSON.parse(JSON.stringify(eachBlog)).total_posts);
                callback();
            },
            function(err){
                //handle error and log it
                if (err) {
                    logger.error('Error in counting total posts for each blog: ' + JSON.stringify(err));
                    //go to next function
                    callback(null, totalBlogData);
                } else {
                    //go to next function
                    callback(null, totalBlogData);
                }
            });
        },
        //3. Function to get all blog names of user follows
        function(totalBlogData, callback) {
            client.userFollowing(function (err, follows) {
                async.forEachSeries(follows.blogs, function (eachBlog, callback) {
                        allBlogNameArray.push(eachBlog.name);
                        callback();
                    },
                    function (errInAsync) {
                        if (errInAsync) {
                            logger.error('Error in async series of saveEachBlogUserFollows');
                            callback(null, totalBlogData, allBlogNameArray);
                        } else {
                            logger.info('Going to the next function to get link type posts of each blog the user follows');
                            callback(null, totalBlogData, allBlogNameArray);
                        }
                    });
            });
        },
        //4. Function to count link posts for each blog
        function(totalBlogData, allBlogNameArray, callback) {
            async.forEachSeries(allBlogNameArray, function(eachBlog, callback) {
                client.blogPosts(eachBlog, {type: 'link'}, function (err, resp) {
                    if (err) {
                        logger.error('Error in finding blogs of type link: ' + JSON.stringify(err));
                        callback();
                    } else {
                        logger.info('The number of link type posts for ' + eachBlog + ' is: ' + resp.posts.length);
                        output.info('The number of link type posts for ' + eachBlog + ' is: ' + resp.posts.length);
                        callback();
                    }
                });
            },
            function(errFinal){
                if (errFinal) {
                    logger.error('Error in async of finding posts of link type for each blog');
                    callback(null, totalBlogData, allBlogNameArray);
                } else {
                    logger.info('Going to function 5 to find number of text type posts fo each blog');
                    callback(null, totalBlogData, allBlogNameArray);
                }
            });
        },
        //5. Function to count text posts for each blog
        function(totalBlogData, allBlogNameArray, callback) {
            async.forEachSeries(allBlogNameArray, function(eachBlog, callback) {
                client.blogPosts(eachBlog, {type: 'text'}, function (err, resp) {
                    if (err) {
                        logger.error('Error in finding blogs of type text: ' + JSON.stringify(err));
                        callback();
                    } else {
                        logger.info('The number of text type posts for ' + eachBlog + ' is: ' + resp.posts.length);
                        output.info('The number of text type posts for ' + eachBlog + ' is: ' + resp.posts.length);
                        callback();
                    }
                });
            },
            function(errFinal){
                if (errFinal) {
                    logger.error('Error in async of finding posts of text type for each blog');
                    callback(null, totalBlogData, allBlogNameArray);
                } else {
                    logger.info('Going to function 6 to find number of photo type posts for each blog');
                    callback(null, totalBlogData, allBlogNameArray);
                }
            });
        },
        //6. Function to count photo posts for each blog
        function(totalBlogData, allBlogNameArray, callback) {
            async.forEachSeries(allBlogNameArray, function(eachBlog, callback) {
                client.blogPosts(eachBlog, {type: 'photo'}, function (err, resp) {
                    if (err) {
                        logger.error('Error in finding blogs of type photo: ' + JSON.stringify(err));
                        callback();
                    } else {
                        logger.info('The number of photo type posts for ' + eachBlog + ' is: ' + resp.posts.length);
                        output.info('The number of photo type posts for ' + eachBlog + ' is: ' + resp.posts.length);
                        callback();
                    }
                });
            },
            function(errFinal){
                if (errFinal) {
                    logger.error('Error in async of finding posts of photo type for each blog');
                    callback(null, totalBlogData, allBlogNameArray);
                } else {
                    logger.info('Going to final function');
                    callback(null, totalBlogData, allBlogNameArray);
                }
            });
        }
    ], function(errWaterfall, result) {
        logger.info('Total data analysed: ' + totalBlogData.length);
        //close the program after 1 second
        setTimeout((function() {  
            return process.exit(22);
        }), 1000);
    })
}
