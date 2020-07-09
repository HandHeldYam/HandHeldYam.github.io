//router.js

var express = require('express');
var router = express.Router();

//  mainMenu page Route
router.get('/', function (req, res) {
  res.send('sent to main menu');
})

//index Page Route
router.get('/index', function (req, res) {
  res.send('Login Page');
})


module.exports = router;
