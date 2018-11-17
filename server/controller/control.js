'use strict';

//get the tweets model
var TweetsDB = require('../model/tumblrSchema');
//get the consumer and access keys from JSON
var keys = require('./../keys/keys');
//include tumble
var tumblr = require('tumblr.js');
// Authenticate via OAuth 1.0a
// var client = tumblr.createClient({
//     consumer_key: keys.consumer_key,
//     consumer_secret: keys.consumer_secret,
//     token: keys.token,
//     token_secret: keys.token_secret
// });

var client = tumblr.createClient({
    consumer_key: 'K2yRwUcBMNE2JFREmMvBzcK0Nd3tFKRu8lHLon5r3EcjOnu4q5',
    consumer_secret: 'TCtrYzDrmMfgAhHamqkriJvH42qfXPwCVjZkAnwTMPS8HrWU6N',
    token: 'q9NZVcV5yBDEE7fLTsA1C5oxkxFEeafvfnMRs4S1HpWhCnXcZS',
    token_secret: '00W1tD5Sm80IcqdvBlFC71zCPMf5BGpsytqCNFu10MtQXzSZ0b'
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

//function to get the user data
exports.getData = function () {
    client.userInfo(function (err, data) {
        if (err) {
            logger.error('Error occured in getting user info: ' + err);
        } else {
            data.user.blogs.forEach(function (blog) {
                // logger.info('User Information: ' + JSON.stringify(blog));
            });
        }
    });

    client.blogPosts('oh-glasgow', function (err, resp) {
        logger.info('Blog oh-glasgow posts count: ' + JSON.stringify(resp.posts.length));
    });

    client.blogPosts('spiritology.tumblr.com', function (err, bL) {
        logger.info('Blog oh-glasgow likes count: ' + JSON.stringify(bL.posts));
    });

    client.userFollowing(function (err, follows) {
        logger.info('User Followings count: ' + JSON.stringify(follows.blogs.length));
    });

    client.userLikes(function (err, likes) {
        logger.info('User Likes count: ' + JSON.stringify(likes.liked_count));
    });
}