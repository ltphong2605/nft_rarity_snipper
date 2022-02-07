/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to collecion api request.
*/

var express = require('express')
var router = express.Router();
var collectionController = require("./../controller/collectionController")
var auth = require("./../../../middleware/auth");
const { check } = require('express-validator');

router.post('/add',[check('name').not().isEmpty(),check('address').not().isEmpty(),auth],collectionController.add)
router.post('/list',collectionController.list)
router.post('/rarity',[check('address').not().isEmpty()],collectionController.rarity)

module.exports = router