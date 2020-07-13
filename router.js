//router.js
var express = require('express');
var router = express.Router();

//  mainMenu page Route
router.get('/', function (req, res) {
  console.log('middle ware for root used');
});

//index page Route
router.get('/index', function (req, res) {
  res.send('Login Page');
});

//smCodeAndJira page Route
router.get('/smCodeAndJira', function (req, res) {
  res.send('Jira Integration page');
});

//connectionTest page Route
router.get('/connectionTest', function (req, res) {
  res.send('testing connection..');
});
//planningPokerScreem page Route
  router.get('/planingPokerScreen', function (req, res) {
    res.send('Planning Poker Screen');
  });

//underConstruction page Route
  router.get('/underConstruction', function (req, res) {
    res.send('Page is under construction');
  });
//Post request Route for roomCodeApi
  router.post('/roomCodeApi', function (req, res) {
    res.send('sent to page');
  });

//Post request Route for UserApi
  router.post('/UserApi', function (req, res) {
    res.send('adding user..');
  });

//Post request Route for SM Login
  router.post('/ScrumMaster', function (req, res) {
    res.send('SM Loging in..');
  });



module.exports = router;
