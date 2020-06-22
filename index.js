const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const dirName = 'HandHeldYam.github.io/';

http.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//uses files in the "public" folder
app.use(express.json({ limit: '1mb' }));
var participants = [];
app.get('/', (req, res) => {
    res.sendFile(dirName + '/index.html');
    console.log("used me");
});
app.post('/UserApi', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
    console.log("USer added to list");//no users actually added
});
app.post('/api', (request, response) => {
    console.log("request recieved");
    console.log(request.body);

});
app.post('/roomCodeApi', (request, response) => {
    console.log("request recieved");
    console.log(request.body);
});
