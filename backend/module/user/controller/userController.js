/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the file which used to define all user related api function.
*/

var users = require('./../model/userModel')
var jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var validator = require('validator');
var config = require('./../../../helper/config')
var mailer = require('./../../common/mailController'); 
const crypto = require('crypto');
const { random, add } = require('lodash');

/*
*  This is the function which used to create new user in NFTrarity
*/
exports.register = function(req,res) {
    this.checkUserNameExist(req,res,function(result) {
        if(result) {
           this.checkEmailExist(req,res,function(result){
              this.registerUser(req,res);
           });
        }
    })
}

/**
 * This is the function which used to login user
 */
exports.login = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  

    if(validator.isEmail(req.body.username)) {
        params = {email:req.body.username};
    } else {
        params = {username:req.body.username};
    } 
    this.loginUser(params,req,res);
}

/**
 * This is the function which used to login user
 */
exports.optVerify = function(req,res) {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }  

    params = {activation_code:req.body.activation_code, opt_code: req.body.opt_code};
    this.checkOpt(params,req,res);
}

/*
*  This is the function which used to find user password if user forgot password
*/
exports.forgot = function(req,res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors:errors.array()
        });
        return;
    }
    let params =  {email:req.body.email}
    users.findOne(params, function (err, user) {
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
                message:"User not found"
            });
            return;
        }  
        if(user.status == "inactive") {
            res.json({
                status: false,
                message:"Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if(user.status == "blocked") {
            res.json({
                status: false,
                message:"Your account has been blocked. Contact admin to unblock your account"
            });
            return;
        }

        let newpassword = randomstring.generate({
            length: 6,
            charset: 'alphabetic'
          });  

        user.password = newpassword;
        bcrypt.genSalt(12, function(err, salt) {
            if (err) return;
            // hash the password using our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return;
                // override the cleartext password with the hashed one
                user.password = hash;
                
                users.updateMany({_id: user._id}, {'$set': {
                    'password': user.password,
                    'status': 'reset'
                }}, function(err) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return
                    }    
                    mailer.mail({
                        username : user.first_name + ' ' + user.last_name,
                        content:"Your new password is "+ newpassword
                    },user.email,'Password Reset',config.site_email,function(error,result) {
                        if(error) {
                            console.log("email not working");
                        }           
                        res.json({
                            status: true,
                            message: "Email sent. Please refer your email for new password"
                        });
                        return;
                    });
                });
            });
        });
    })
}

/**
 * This is the function which used to process login user
 */
loginUser = function(params,req,res) {
    users.findOne(params, function (err, user) {
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
        user.comparePassword(req.body.password, (error, match) => {
            if(!match) {
                res.json({
                    status: false,
                    message: "Password is mismatch"
                });
                return;
            }
            if( user.status == 'inactive') {
                res.json({
                    status: false,
                    message: "Your account has been inactive. contact admin to activate your account",
                });
                return;
            }
            if(user.status == 'blocked') {
                res.json({
                    status: false,
                    message: "Your account has been blocked. contact admin to activate your account",
                });
                return;
            }        

            const opt_code = random(100000, 999999);
            const activation_code = crypto.createHash('md5').update(opt_code.toString()).digest('hex');

            mailer.mail({
                Name : user.first_name + ' ' + user.last_name,
                content:"For verify your email address, enter this verification code when prompted: "+ opt_code
            },user.email,'Email Verification',config.site_email,function(error,result) {
                if(error) {
                    console.log("email not working");
                }   
                user.activation_code = activation_code;
                user.opt_code = opt_code;

                users.updateMany({_id: user._id}, {'$set': {
                    'activation_code': activation_code,
                    'opt_code': opt_code
                }}, function(err) {
                    if (err) {
                        res.json({
                            status: false,
                            message: "Request failed",
                            errors:err
                        });
                        return
                    }               
                    res.json({
                        status: true,
                        activation_code:activation_code,
                        opt_code: opt_code,
                        message:"Login successful",
                    }); 
                });
            });
        });
    });
}

/*
*   This is the function handle user registration
*/
registerUser = function (req,res) { 
    
    var user = new users();
    user.username = req.body.username ? req.body.username : "";
    user.email = req.body.email ? req.body.email : "";
    user.password = req.body.password ? req.body.password : "";
    user.first_name = req.body.first_name ? req.body.first_name : "";
    user.last_name = req.body.last_name ? req.body.last_name : "";
    user.account = req.body.account ? req.body.account : "";
    user.status = 'active';
    
    const opt_code = random(100000, 999999);
    const activation_code = crypto.createHash('md5').update(opt_code.toString()).digest('hex');
	/*
    mailer.mail({
        Name : user.first_name + ' ' + user.last_name,
        content:"For verify your email address, enter this verification code when prompted: "+ opt_code
    },user.email,'Email Verification',config.site_email,function(error,result) {
        if(error) {
            console.log("email not working");
        }   */
        user.activation_code = activation_code;
        user.opt_code = opt_code;

        user.save(function (err , user) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            } 
            console.log('opt code: ' + opt_code)
            res.json({
                status: true,
                activation_code:activation_code,
                message:"Register successful",
            });   
        });
    //});
}

/*
*  This function used to find whether user name exist or not
*/
checkUserNameExist = function (req,res,callback) {
    if(req.body.username) {
        users.find({'username':req.body.username},function(err,data) {
            if(err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message: "User Name already Exist",
                    errors:"User Name already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "User Name is required",
            errors:"User Name is required"
        });
        return;
    }
}

/*
*  This function used to find whether email exist or not
*/
checkEmailExist = function (req,res,callback) {
    if(req.body.email) {
        users.find({'email':req.body.email},function(err,data) {
            if(err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors:err
                });
                return;
            }
            if(data.length>0) {
                res.json({
                    status: false,
                    message: "Email already Exist",
                    errors:"Email already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "Email is required",
            errors:"Email is required"
        });
        return;
    }
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

/**
 * This is the function which used to process opt verification
 */
checkOpt = function(params,req,res) {
    users.findOne(params, function (err, user) {
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
        let token = jwt.sign({user_id:user._id,username: user.username,email: user.email,first_name:user.first_name,last_name:user.last_name,photo:user.photo ? user.photo : '',status:user.status,account:user.account? user.account: ''},
                config.secret_key,
                { expiresIn: '24h' // expires in 24 hours
                }
                );
        res.json({
            status: true,
            token:token,
            message:"Verify successful",
        }); 
    });
}

