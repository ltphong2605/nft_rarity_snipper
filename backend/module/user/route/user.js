/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the file which used to define all route releated to user api request.
*/

var express = require('express')
var router = express.Router();
var userController = require("./../controller/userController")
const { check } = require('express-validator');

/*
* service for request from frontend
*/
router.post('/register', userController.register)

router.post('/login',[check('username').not().isEmpty(),check('password').not().isEmpty()],userController.login)

router.post('/opt_verify',[check('activation_code').not().isEmpty(),check('opt_code').not().isEmpty()],userController.optVerify)

router.post('/forgot',[check('email').isEmail()],userController.forgot)

module.exports = router