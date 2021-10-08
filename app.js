const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const express = require('express')
const formidableMiddleware = require('express-formidable')
// declare a new express app
const app = express()

const router = require('./route/routes');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); //Parse URL-encoded bodies
app.use(formidableMiddleware());
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Wrong url"});
});

// using as middleware
app.use('/petstore', router)

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
 });

module.exports = app


