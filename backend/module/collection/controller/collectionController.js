/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the file which used to define all collection related api function.
*/

var collections = require('../model/collectionModel');
var items = require('../model/itemModel');
var users = require('../../user/model/userModel');
var moralis_ctr = require('../generator/main')
const { validationResult } = require('express-validator');
const axios = require('axios');
const fs = require('fs');
const jsonfile = require('jsonfile');
var files = fs.readdirSync('tmp');
var items = require('../model/itemModel');
const config = require('../../../helper/config')
const OpenseaScraper = require("opensea-scraper");
const puppeteer = require('puppeteer')

const options = {
  debug: false,
  logs: false,
  sort: true,
  browserInstance: undefined,
}

/*
* This is the function which used to add collection in database
*/
exports.add = async function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  
    
    await users.findOne({_id:req.decoded.user_id}, function (err, user) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors:err
            });
            return;
        }
        if(this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found",
            });
            return;
        } 
    });

    let collection = new collections();
    collection.name = req.body.name;
    collection.opensea = req.body.opensea ? req.body.opensea : '';
    collection.discord = req.body.discord ? req.body.discord : '';
    collection.telegram = req.body.telegram ? req.body.telegram : '';
    collection.website = req.body.website ? req.body.website : '';
    collection.description = req.body.description;
    collection.blockchain = req.body.blockchain ? req.body.blockchain : '';
    collection.address = req.body.address;
    collection.mint_date = req.body.mint_date ? req.body.mint_date : '';
    collection.reveal_date = req.body.reveal_date ? req.body.reveal_date : '';
    collection.image = req.body.image ? req.body.image : '';
    collection.upcoming = req.body.upcoming ? req.body.upcoming : '';
    collection.featured = req.body.featured ? req.body.featured : '';
    collection.discord_tag = req.body.discord_tag ? req.body.discord_tag : '';
    collection.ticket = req.body.ticket ? req.body.ticket : '';
    collection.author_id = req.decoded.user_id;
    /*
    let collectionData = await this.getCollectionData(collection.address);

    if(!this.isEmptyObject(collectionData)) {

        collection.slug = collectionData['slug'];

        if(collectionData['discord_url'] != null || collectionData['discord_url'] != null) {
            if(collection.discord == '') {
                collection.discord = collectionData['discord_url'];
            }
        }

        if(collectionData['telegram_url'] != null || collectionData['telegram_url'] != null) {
            if(collection.telegram == '') {
                collection.telegram = collectionData['telegram_url'];
            }
        }

        if(collectionData['external_url'] != null || collectionData['external_url'] != null) {
            if(collection.website == '') {
                collection.website = collectionData['external_url'];
            }
        }

        if(collectionData['image_url'] != null || collectionData['image_url'] != null) {
            if(collection.image == '') {
                collection.image = collectionData['image_url'];
            }
        }
    } else {
            res.json({
            status: false,
            message: "Collection not Exist on OpenSea",
            errors:'empty'
        });
        return;
    }  
	*/
    collection.save(function (err) {
        if (err) {
            let w_err = 'Request Failed'            
            if(err.keyValue) {
                if(err.keyValue.address){
                    w_err = "Collection already Exist"
                }
            }
            res.json({
                status: false,
                message: w_err,
                errors:err
            });
            return;
        }
        res.json({
            status: true,
            message: "Collection added successfully"
        });    
        //this.saveNFTs(collection.address); 
        return;                   
    });
}

/**
 * This is the function which used to list collection with filters
 */
exports.list = function(req,res) {
    var featured = req.body.featured ? req.body.featured : '';
    var upcoming = req.body.upcoming ? req.body.upcoming : '';
    var limit = req.body.paginationLimit ? parseInt(req.body.paginationLimit) : 18;
    var offset = req.body.offset ? parseInt(req.body.offset) : 0;
    var query = collections.find();
    var search = {};
    if(featured != '' && upcoming != '') {
        search = { $and: [ { 
            featured :   {
                $regex: new RegExp(featured, "ig")
        }  },{ 
            upcoming :   {
                $regex: new RegExp(upcoming, "ig")
        }  }] }
        query = query.and(search)
    } else {
        if ( featured != '' ) {
            search = { $and: [ { 
                featured :   {
                    $regex: new RegExp(featured, "ig")
            }  }] }
            query = query.and(search)
        }

        if ( upcoming != '' ) {
            search = { $and: [ { 
                upcoming :   {
                    $regex: new RegExp(upcoming, "ig")
            }  }] }
            query = query.and(search)
        }
    }
        
    query = query.sort('-create_date')
    
    var fields = ['name','slug','opensea','discord','telegram','website','description','blockchain','address','mint_date','reveal_date','image','upcoming','featured','discord_tag','ticket']
    collections.find(query, fields, {skip: offset, limit: limit}).then(function (result) {
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: result
        });
    }); 
}

/**
 * This is the function which used to list items with filters
 */
exports.rarity = async function(req,res) {

    let limit = req.body.paginationLimit ? parseInt(req.body.paginationLimit) : 10;
    let offset = req.body.offset ? parseInt(req.body.offset) : 0;
    let orderby = req.body.orderDirection ? req.body.orderDirection : 'asc';
    let address = req.body.address;
    let slug = req.body.slug ? req.body.slug : '';
    let token_id = req.body.token_id ? req.body.token_id : '';
    let filter_button = req.body.filter_button ? req.body.filter_button : '';
    let filter_price = req.body.filter_price ? req.body.filter_price : '';
    let rarity_min = req.body.rarity_min ? req.body.rarity_min : '';
    let rarity_max = req.body.rarity_max ? req.body.rarity_max : '';

    let query = collections.find();

    search = { $and: [ { 
        address : address
     }] }

    query = query.and(search)

    if(token_id != ''){
        let sub_search = { $and: [ { 
            token_id :   token_id  
        }] }

        query = query.and(sub_search)
    }

    if(rarity_min != ''){
        let sub_search = { $and: [ { 
            rarity :   {
                $gte: rarity_min
        }  }] }

        query = query.and(sub_search)
    }

    if(rarity_max != ''){
        let sub_search = { $and: [ { 
            rarity :   {
                $lte: rarity_max
        }  }] }

        query = query.and(sub_search)
    }
    
    let token_search = '';
    if(filter_button != '' || filter_price != ''){
        token_search = await this.getResultByFilter(slug, filter_button + filter_price, limit);
        if(token_search)
            query = query.and(token_search)
    }
        
    if(orderby == 'asc') {
        query = query.sort('rarity')
    } else {
        query = query.sort('-rarity')
    }    
 
    var fields = ['token_id','rarity','ranking','address', 'attr'];
    await items.find(query, fields, {skip: offset, limit: limit}).then(function (result) {
        res.json({
            status: true,
            message: "NFTs retrieved successfully",
            data: result
        });
    }); 
}

exports.reloadData = async function() {
    var upcoming = 'no';
    var query = collections.find();

    var search = {};
    if ( upcoming != '' ) {
        search = { $and: [ { 
            upcoming :   {
                $regex: new RegExp(upcoming, "ig")
        }  }] }
        query = query.and(search)
    }
        
    query = query.sort('create_date')
    
    var fields = ['address']
    var ret = '';
    await collections.find(query, fields).then(function (result) {
        ret = result;
    }); 

    for(let i = 0; i < ret.length; i++) {
        await this.saveNFTs(ret[i]['address']);
    }
}

/**
 *   This is the function check object is empty or not
 */
getCollectionData = async function (address) {
    let url = 'https://api.opensea.io/asset_contract/' + address;

    return await axios.get(url)
            .then(function (response) {
                // handle success
                return response.data['collection'];         
            })
            .catch(function (error) {
                return;
            })
}

saveNFTs = async function(address) {
    let nfts = await moralis_ctr.generateRarity(address);
    if(!nfts || nfts.length == 0) return;
    
    await items.deleteMany({address: address});

    for(let i = 0; i < nfts.length; i++ ){
        var item = new items();
        item.token_id = nfts[i]['token_id'];
        item.rarity = nfts[i]['rarity'];
        item.address = address;
        item.attr = nfts[i]['attr'];
        item.ranking = i + 1;
        
        await item.save(function (err) {
            if(err)
                console.log(err)                          
        });  
    }
}

getResultByFilter = async function(slug, filter, paginationLimit) {
    await puppeteer.launch({ args: ['--no-sandbox'] })
    let url = config.opensea_collection_url + slug + "?" + filter;
    let result = await OpenseaScraper.offersByUrl(url, options);
    let data = result['offers'];
 
    let search = {'$or':[]};
    for(let i = 0; i < data.length; i++){
        let obj = {token_id: data[i]['tokenId']};
        search['$or'].push(obj);
    }
    return search;
}

/**
 *   This is the function check object is empty or not
 */
isEmptyObject = function (obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}
