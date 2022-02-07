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

var itemSchema = mongoose.Schema({
    token_id: {
        type: String
    }, 
    rarity: {
        type: Number
    },
    ranking: {
        type: Number
    },
    address: {
        type: String
    },
    attr: {
        type: Object
    }
});

itemSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('item', itemSchema,config.db.prefix+'item');