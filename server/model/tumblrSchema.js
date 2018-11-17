//require mongoose module
var mongoose = require('mongoose');

//create schema variable
var Schema = mongoose.Schema;

/**
 * Schema for database
 */
var tumblrSch = new Schema({}, {
    strict: false
});


/**
 * indexing the schema and making the ____ field as unique 
 * this will not on the existing database schema, but only on the 
 * new schema, so to make this work, drop existing schema and 
 * create a new one
 */
// tumblrSch.index({
//     id_str: 1
// }, {
//     unique: true
// });

/**
 * we need to create a model using it and export it
 */
module.exports.tumblrSchema = mongoose.model('tumblrSchema', tumblrSch);