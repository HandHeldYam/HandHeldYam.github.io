const express = require('express');
const app = express();
const server = require('http').Server(app);
var socket = require('socket.io');
var io = socket(server);
const dirName = 'HandHeldYam.github.io/';

server.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//uses files in the "public" folder
app.use(express.json({ limit: '1mb' }));
var participants = [];

// app.get('/', (req, res) => {
//     res.sendFile(dirName + '/connectionTest.html');
// });
io.sockets.on('connection', onConnect);
function onConnect(socket) {
    console.log('new connection' + socket.id);
    participants.push(socket.id);
}
io.on('clicked', (data) => {
    console.log(data);
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
