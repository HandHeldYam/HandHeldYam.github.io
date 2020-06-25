const express = require('express');
const app = express();
const server = require('http').Server(app);
const connectDB = require('./config/db');


var socket = require('socket.io');
var io = socket(server);

const dirName = 'HandHeldYam.github.io/';
connectDB();
server.listen(3000, () => console.log('Listening on Port 3000'));
app.use(express.static('public'));//uses files in the "public" folder
app.use(express.json({ limit: '1mb' }));
var clients = [];

// app.get('/', (req, res) => {
//     res.sendFile(dirName + '/connectionTest.html');
// });
io.sockets.on('connection', onConnect);
function onConnect(socket) {
    console.log('new connection' + socket.id);
    c = new Client(socket.id, "temp", "get from json");
    clients.push(Client);
    console.log(clients);
}
io.sockets.on("newClient", function handleClient() {
    console.log("new Client connected");
});

function Client(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
}

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
