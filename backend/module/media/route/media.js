/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to media controller
*/

var express = require('express')
var router = express.Router();
var mediaController = require("../controller/mediaController")
var multer  = require('multer')

var collectionstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/images/collection')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var collectionupload = multer({ storage: collectionstorage })

router.post('/',collectionupload.single('file'),mediaController.uploadImage)
module.exports = router