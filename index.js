const express = require('express');
const app = express();
const server = require('http').Server(app);
app.use(express.static('public'));//listens to files in the
const path = require('path');
var router = require('./router.js');
//app.use('./router', router);

console.log(__dirname);
//"public" folder
//app.use('public', express.static(__dirname));
app.use(express.json({ limit: '1mb' }));

var socket1 = require('socket.io');
var io = socket1(server);

var clients = [];
var validRoomCodes = [];
server.listen(3000, () => console.log('Listening on Port 3000'));

// Import npm packages
const mongoose = require('mongoose');

//Connect to database
const uri = "mongodb+srv://nicolefitz:nicolefitz@cluster0-inygt.mongodb.net/users?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!!!!');
});

//Schema for user data
const Schema = mongoose.Schema;
const clientDataSchema = new Schema({
    name: String,
    type: String
});

//Model
const clientDataModel = mongoose.model('clientData', clientDataSchema);

//specifying URL path of router.js





app.get('/', (req, res) => {
   res.sendFile('mainMenu.html', { root:'./' });
   console.log('sent to main menu');
});

app.get('/index', (req, res) => {
   res.sendFile('index.html',{root: './'});
});
app.get('/smCodeAndJira', (req, res) => {
    res.sendFile('smCodeAndJira.html', {root: './'});
});
app.get('/connectionTest', (req, res) => {
    res.sendFile('connectionTest.html', {root: './'});
});
app.post('/roomCodeApi', (req, res) => {
    console.log('hit post request');
    console.log(req.body);
    if (onCorrectRoomCode(req.body.code)) {
        res.sendStatus(201);
    }
});
app.get('/planningPokerScreen', (req, res) => {
    res.sendFile('planningPokerScreen.html', {root: './'});
    }
);

app.get('/underConstruction', (req, res) => {
    res.sendFile('underConstruction.html', { root: './' });
})
io.sockets.on('connection', onConnect);
function onConnect(socket) {
    console.log('new connection' + socket.id);
    c = new Client(socket.id, "temp", "get from json");
    clients.push(Client);
    console.log("connected to client");

    socket.on("newClient", handleClient);
    socket.on("disconnect", onDisconnect);
}

function handleClient(data) {
    console.log('Client connecting with code: ' + data.roomCode);
}
function onDisconnect(socket) {
    console.log(socket.id + ' Attempting to disconnect');
}

class Client{
    constructor(id, name, type) {
    this.id = id;
    this.name = name;
    this.type = type;
    }

}

app.post('/UserApi', (request, response) => {
   console.log("request recieved");
   const data = request.body;
   console.log(data);
    //Add client to database
   clientDataModel.collection.insertOne({ data }, function (err) {
       if (err) return handleError(err);
       console.log("User successfully added to Database");
   });

   console.log("USer added to list");//no users actually added
});

//room code that users put in (not SM)

function onCorrectRoomCode(code) {
    for (var i = 0; i < validRoomCodes.length; i++){
        if (code === validRoomCodes[i]) {
            return true;
        }
    }
    return false;
}

app.post('/ScrumMaster', (req, res) => {
   validRoomCodes.push(req.body.code);
   console.log(validRoomCodes);
})
