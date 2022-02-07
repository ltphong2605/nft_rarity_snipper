/*
Project : NFTrarity
FileName : index.js
Author : LinkWell
File Created : 10/01/2022
CopyRights : LinkWell
Purpose : This is the main file which is first executed when running nodejs application through command line. It will load all relevant packages and depedencies for API request.
*/

const express = require('express')
const app = express()
var config = require("./helper/config")
var bodyParser = require('body-parser');

var user = require("./module/user/route/user")
var collection = require("./module/collection/route/collection")
var media = require("./module/media/route/media")
var collectionController = require("./module/collection/controller/collectionController")
var mongoose = require('mongoose');
var cors = require('cors')
global.__basedir = __dirname;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/media'));
app.use(cors())

/*
* Below lines used to connect databse moongoose ORM
*/
mongoose.connect('mongodb://'+config.db.host+':'+config.db.port+'/'+config.db.name, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
var db = mongoose.connection;
// Added check for DB connection
db.on('connected', () => console.log('Connected'));
db.on('error', () => console.log('Connection failed'));

/*
* Below lines used to define route for the api services
*/
app.get('/', (req, res) => res.send('Welcome to NFTrarity API'))
app.use('/user', user)
app.use('/media', media)
app.use('/collection', collection)

setInterval(function(){
    collectionController.reloadData();
  }, 24 * 60 * 60 * 1000); 

/*
* Below lines used to handle invalid api calls
*/
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})




/*
* Below lines used to run api service 
*/
app.listen(config.app.port, () => console.log(`NFTrarity app listening on port ${config.app.port}!`))