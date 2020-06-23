const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const dirName = 'HandHeldYam.github.io/';

server.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//uses files in the "public" folder
app.use(express.json({ limit: '1mb' }));
var participants = [];

io.on('connection', (socket) => {
    console.log('a user connected');
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
