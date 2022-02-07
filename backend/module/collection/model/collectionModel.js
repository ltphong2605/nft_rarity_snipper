/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the file which used to define collection schema that will communicate and process collection information with mongodb through mongoose ODM.
*/

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var config = require('./../../../helper/config')
const Schema = mongoose.Schema;
// Setup schema
var collectionSchema = mongoose.Schema({
    name: {
        type: String,
        minlength: [3, 'Name must be 3 characters or more'],
        maxlength: [255, "Name can't exceed 255 characters"],
        unique: [ true , 'Collection Name already exists. Please try a different name'],
        required: [ true , 'Name is required'], 
    },  
    slug: {
        type: String
    },
    opensea: {
        type: String
    },   
    discord: {
        type: String
    },   
    telegram: {
        type: String
    },   
    website: {
        type: String
    },
    description: {
        type: String,
        maxlength: [1000, "Description can't exceed 1000 characters"]
    },   
    blockchain:{
        type: String
    },
    address: {
        type: String,
        unique: [ true , 'Collection Address already exists. Please try a different address'],
        required: [ true , 'Name is required'], 
    },
    mint_date: {
        type: String
    }, 
    reveal_date: {
        type: String
    },   
    image:{
        type: String
    },   
    upcoming:{
        type: String
    },   
    featured:{
        type: String
    },
    discord_tag:{
        type: String
    },
    ticket:{
        type: String
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    author_id: { type: Schema.Types.ObjectId, ref: 'users' }
});

collectionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('collection', collectionSchema,config.db.prefix+'collection');