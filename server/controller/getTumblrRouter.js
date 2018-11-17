'use strict';

//include express package
var express = require('express');
//for routing
var router = express.Router();
//get the controller
var controller = require('./getTumblrController');

//GET HTTP router methods for /getData
//GET
router.get('/', controller.getData);

//export the router
module.exports = router;